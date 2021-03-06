package org.viqueen.atlassian.confluence.rest;

import com.atlassian.annotations.security.XsrfProtectionExcluded;
import com.atlassian.confluence.api.model.content.Content;
import com.atlassian.confluence.api.model.content.ContentRepresentation;
import com.atlassian.confluence.api.model.content.ContentType;
import com.atlassian.confluence.api.model.content.Space;
import com.atlassian.confluence.api.model.content.SpaceType;
import com.atlassian.confluence.api.model.longtasks.LongTaskSubmission;
import com.atlassian.confluence.api.model.pagination.PageResponse;
import com.atlassian.confluence.api.model.pagination.SimplePageRequest;
import com.atlassian.confluence.api.service.content.ContentService;
import com.atlassian.confluence.api.service.content.SpaceService;
import com.atlassian.confluence.api.service.exceptions.ServiceException;
import com.atlassian.confluence.api.service.watch.WatchService;
import com.atlassian.confluence.mail.notification.Notification;
import com.atlassian.confluence.mail.notification.NotificationManager;
import com.atlassian.confluence.rest.api.model.ExpansionsParser;
import com.atlassian.confluence.spaces.SpaceManager;
import com.atlassian.confluence.user.AuthenticatedUserThreadLocal;
import com.atlassian.confluence.user.ConfluenceUser;
import com.atlassian.confluence.user.UserAccessor;
import com.atlassian.confluence.util.longrunning.LongRunningTaskId;
import com.atlassian.confluence.util.longrunning.LongRunningTaskManager;
import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import com.atlassian.sal.api.permission.PermissionEnforcer;
import com.atlassian.user.EntityException;
import com.atlassian.user.User;
import com.atlassian.user.UserManager;
import com.atlassian.user.search.page.Pager;
import com.github.javafaker.Faker;
import org.viqueen.atlassian.confluence.services.FakerService;
import org.viqueen.atlassian.confluence.tasks.DevboxLongRunningTask;

import javax.ws.rs.DELETE;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import static java.text.MessageFormat.format;
import static java.util.Collections.singletonList;
import static java.util.Collections.singletonMap;
import static java.util.stream.Collectors.joining;
import static java.util.stream.Collectors.toList;

@Path("/spaces")
public class SpacesResource {

    private final SpaceService spaceService;
    private final WatchService watchService;
    private final UserAccessor userAccessor;
    private final UserManager userManager;
    private final ContentService contentService;
    private final LongRunningTaskManager taskManager;
    private final PermissionEnforcer permissionEnforcer;
    private final NotificationManager notificationManager;
    private final SpaceManager spaceManager;
    private final FakerService fakerService;

    public SpacesResource(
            final @ComponentImport SpaceService spaceService,
            final @ComponentImport WatchService watchService,
            final @ComponentImport UserAccessor userAccessor,
            final @ComponentImport UserManager userManager,
            final @ComponentImport ContentService contentService,
            final @ComponentImport LongRunningTaskManager taskManager,
            final @ComponentImport PermissionEnforcer permissionEnforcer,
            final @ComponentImport NotificationManager notificationManager,
            final @ComponentImport SpaceManager spaceManager,
            final FakerService fakerService
    ) {
        this.spaceService = spaceService;
        this.watchService = watchService;
        this.userAccessor = userAccessor;
        this.userManager = userManager;
        this.contentService = contentService;
        this.taskManager = taskManager;
        this.permissionEnforcer = permissionEnforcer;
        this.notificationManager = notificationManager;
        this.spaceManager = spaceManager;
        this.fakerService = fakerService;
    }

    @GET
    @Path("/ping")
    public Response ping() {
        permissionEnforcer.enforceAdmin();
        return Response.ok(
                singletonMap(
                        "components",
                        singletonList(spaceService.toString())
                )
        ).build();
    }

    @GET
    @Path("/personal")
    public Response personal() {
        Optional<Space> space = spaceService.find()
                .withKeys(getSpaceKeyForCurrentUser())
                .withType(SpaceType.PERSONAL)
                .fetch();

        return space.map(Response::ok)
                .orElse(Response.status(Response.Status.NOT_FOUND))
                .build();
    }

    private static String getSpaceKeyForCurrentUser() {
        ConfluenceUser confluenceUser = AuthenticatedUserThreadLocal.get();
        return "~" + confluenceUser.getName();
    }

    @GET
    @Path("/{spaceKey}/watchers/count")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getSpaceWatchersCount(
            @PathParam("spaceKey") final String spaceKey
    ) {
        permissionEnforcer.enforceAdmin();
        ConfluenceUser confluenceUser = AuthenticatedUserThreadLocal.get();
        List<Notification> notificationsBySpaceAndType = notificationManager.getNotificationsBySpaceAndType(
                spaceManager.getSpace(spaceKey),
                null
        );
        long count = notificationsBySpaceAndType.stream()
                .filter(n -> !confluenceUser.equals(n.getReceiver()))
                .count();
        return Response.ok(singletonMap("count", count)).build();
    }

    @POST
    @Path("/{spaceKey}/watchers")
    @Produces(MediaType.APPLICATION_JSON)
    public Response setSpaceWatchers(
            @PathParam("spaceKey") final String spaceKey,
            @QueryParam("count") @DefaultValue("100") final int count
    ) {
        permissionEnforcer.enforceAdmin();
        ConfluenceUser confluenceUser = AuthenticatedUserThreadLocal.get();
        try {
            Pager<User> users = userManager.getUsers();
            users.getCurrentPage()
                    .stream()
                    .map(user -> userAccessor.getUserByName(user.getName()))
                    .filter(
                            user ->
                                    user != null
                                            && !userAccessor.isDeactivated(user)
                                            && !confluenceUser.equals(user)
                    )
                    .limit(count)
                    .map(ConfluenceUser::getKey)
                    .forEach(userKey -> watchService.watchSpace(userKey, spaceKey));
            return Response.status(Response.Status.CREATED).build();
        } catch (EntityException exception) {
            throw new ServiceException(exception.getMessage(), exception);
        }
    }

    @DELETE
    @Path("/{spaceKey}/watchers")
    @Produces(MediaType.APPLICATION_JSON)
    public Response unsetSpaceWatchers(@PathParam("spaceKey") final String spaceKey) {
        permissionEnforcer.enforceAdmin();
        try {
            Pager<User> users = userManager.getUsers();
            users.getCurrentPage()
                    .stream()
                    .map(user -> userAccessor.getUserByName(user.getName()))
                    .filter(user -> user != null && !userAccessor.isDeactivated(user))
                    .map(ConfluenceUser::getKey)
                    .forEach(userKey -> watchService.unwatchSpace(userKey, spaceKey));
            return Response.status(Response.Status.NO_CONTENT).build();
        } catch (EntityException exception) {
            throw new ServiceException(exception.getMessage(), exception);
        }
    }

    @POST
    @Path("/{spaceKey}/mentions")
    @Produces(MediaType.APPLICATION_JSON)
    public Response mentionUsers(
            @PathParam("spaceKey") final String spaceKey,
            @QueryParam("count") @DefaultValue("20") final int count
    ) {
        permissionEnforcer.enforceAdmin();
        try {
            Pager<String> userNames = userManager.getUserNames();
            String mentions = userNames.getCurrentPage()
                    .stream()
                    .limit(count)
                    .filter(Objects::nonNull)
                    .map(userName -> format("<ac:link><ri:user ri:username=\"{0}\" /></ac:link>", userName))
                    .collect(joining("<br/>"));
            Faker instance = fakerService.getInstance();
            Content content = contentService.create(
                    Content.builder()
                            .space(spaceKey)
                            .type(ContentType.PAGE)
                            .title(format("{0} - {1}", instance.rockBand().name(), Instant.now().getEpochSecond()))
                            .body(format("<p>{0}</p>", mentions), ContentRepresentation.STORAGE)
                            .build()
            );
            return Response.ok(content).build();
        } catch (EntityException e) {
            throw new ServiceException(e.getMessage(), e);
        }
    }

    @POST
    @Path("/{spaceKey}/updates")
    @Produces(MediaType.APPLICATION_JSON)
    public Response updates(@PathParam("spaceKey") final String spaceKey) {
        permissionEnforcer.enforceAdmin();
        LongRunningTaskId taskId = taskManager.startLongRunningTask(
                AuthenticatedUserThreadLocal.get(),
                new DevboxLongRunningTask("update-space", () -> {
                    final PageResponse<Content> contents = contentService.find(ExpansionsParser.parse("version,space,ancestors"))
                            .withSpace(Space.builder().key(spaceKey).build())
                            .fetchMany(ContentType.PAGE, new SimplePageRequest(0, 100));

                    contents.getResults().forEach(content -> {
                        final Faker instance = fakerService.getInstance();
                        contentService.create(
                                Content.builder()
                                        .type(ContentType.COMMENT)
                                        .container(content)
                                        .body(format("<p>{0}</p>", instance.chuckNorris().fact()), ContentRepresentation.STORAGE)
                                        .build()
                        );
                    });
                })
        );

        return Response.ok(taskId.asLongTaskId()).build();
    }

    @DELETE
    @Produces("application/json")
    @XsrfProtectionExcluded
    public Response deleteAll(
            @QueryParam("start") @DefaultValue("0") final int start,
            @QueryParam("limit") @DefaultValue("100") final int limit
    ) {
        permissionEnforcer.enforceAdmin();
        final List<LongTaskSubmission> tasks = spaceService.find()
                .fetchMany(new SimplePageRequest(start, limit))
                .getResults()
                .stream()
                .map(spaceService::delete)
                .collect(toList());
        return Response.status(Response.Status.ACCEPTED).entity(tasks).build();
    }
}
