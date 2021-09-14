package org.viqueen.atlassian.confluence.rest;

import com.atlassian.confluence.api.model.content.id.ContentId;
import com.atlassian.confluence.api.service.content.ContentService;
import com.atlassian.confluence.pages.PageManager;
import com.atlassian.confluence.rest.api.model.ExpansionsParser;
import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import org.springframework.beans.factory.annotation.Autowired;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;

import static com.atlassian.confluence.api.model.validation.ServiceExceptionSupplier.notFound;

@Path("/content")
public class ContentResource {

    private final ContentService contentService;

    @Autowired
    public ContentResource(
            @ComponentImport final ContentService contentService
    ) {
        this.contentService = contentService;
    }

    @GET
    @Path("/{id}")
    @Produces("application/json")
    public Response get(@PathParam("id") final long contentId) {
        return contentService.find(ExpansionsParser.parse("body.storage")).withId(ContentId.of(contentId)).fetch()
                .map(content -> Response.ok(content).build())
                .orElseThrow(notFound("content not found for id : " + contentId));
    }
}
