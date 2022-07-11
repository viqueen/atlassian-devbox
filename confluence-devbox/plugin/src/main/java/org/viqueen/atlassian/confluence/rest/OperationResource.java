package org.viqueen.atlassian.confluence.rest;

import com.atlassian.confluence.api.model.content.id.ContentId;
import com.atlassian.confluence.api.model.permissions.OperationCheckResult;
import com.atlassian.confluence.api.model.permissions.Target;
import com.atlassian.confluence.api.service.content.ContentService;
import com.atlassian.confluence.api.service.content.SpaceService;
import com.atlassian.confluence.api.service.permissions.OperationService;
import com.atlassian.confluence.rest.api.model.ExpansionsParser;
import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import org.springframework.beans.factory.annotation.Autowired;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Collections;
import java.util.List;

@Path("/operation")
public class OperationResource {

    private final ContentService contentService;
    private final SpaceService spaceService;
    private final OperationService operationService;

    @Autowired
    public OperationResource(
            @ComponentImport final ContentService contentService,
            @ComponentImport final SpaceService spaceService,
            @ComponentImport final OperationService operationService
    ) {
        this.contentService = contentService;
        this.spaceService = spaceService;
        this.operationService = operationService;
    }

    @GET
    @Path("/content/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response contentWithId(@PathParam("id") final long id) {
        List<OperationCheckResult> operationCheckResults = contentService.find(ExpansionsParser.parse("container")).withId(ContentId.of(id))
                .fetch()
                .map(content -> operationService.getAvailableOperations(Target.forModelObject(content)))
                .orElse(Collections.emptyList());
        return Response.ok(operationCheckResults).build();
    }

    @GET
    @Path("/space/{spaceKey}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response spaceWithKey(@PathParam("spaceKey") final String spaceKey) {
        List<OperationCheckResult> operationCheckResults = spaceService.find().withKeys(spaceKey)
                .fetch()
                .map(space -> operationService.getAvailableOperations(Target.forModelObject(space)))
                .orElse(Collections.emptyList());
        return Response.ok(operationCheckResults).build();
    }
}
