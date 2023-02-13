package org.viqueen.atlassian.confluence.rest;

import com.atlassian.confluence.api.model.pagination.SimplePageRequest;
import com.atlassian.confluence.api.model.search.SearchOptions;
import com.atlassian.confluence.api.model.search.SearchPageResponse;
import com.atlassian.confluence.api.model.search.SearchResult;
import com.atlassian.confluence.api.service.search.CQLSearchService;
import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import org.springframework.beans.factory.annotation.Autowired;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;

@Path("/attachment")
public class AttachmentResource {

    private final CQLSearchService searchService;

    @Autowired
    public AttachmentResource(
            @ComponentImport final CQLSearchService searchService
    ) {
        this.searchService = searchService;
    }

    @GET
    @Path("/by-space/{spaceKey}")
    @Produces("application/json")
    public Response getBySpace(@PathParam("spaceKey") final String spaceKey) {
        SearchPageResponse<SearchResult> result = searchService.search(
                "type=attachment AND space=" + spaceKey,
                SearchOptions.builder().build(),
                new SimplePageRequest(0, 20)
        );
        return Response.ok(result).build();
    }
}
