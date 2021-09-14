package org.viqueen.atlassian.confluence.rest;

import javax.ws.rs.HEAD;
import javax.ws.rs.Path;
import javax.ws.rs.core.Response;

@Path("/health-check")
public class HealthCheckResource {

    @HEAD
    @Path("/ping")
    public Response ping() {
        return Response.status(Response.Status.OK).build();
    }

}
