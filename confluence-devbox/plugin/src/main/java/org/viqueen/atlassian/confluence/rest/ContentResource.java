package org.viqueen.atlassian.confluence.rest;

import com.atlassian.confluence.api.model.content.ContentRepresentation;
import com.atlassian.confluence.api.model.content.MacroInstance;
import com.atlassian.confluence.api.model.content.id.ContentId;
import com.atlassian.confluence.api.model.validation.ServiceExceptionSupplier;
import com.atlassian.confluence.api.service.content.ContentMacroService;
import com.atlassian.confluence.api.service.content.ContentService;
import com.atlassian.confluence.content.render.xhtml.DefaultConversionContext;
import com.atlassian.confluence.content.render.xhtml.XhtmlException;
import com.atlassian.confluence.content.render.xhtml.storage.macro.MacroId;
import com.atlassian.confluence.rest.api.model.ExpansionsParser;
import com.atlassian.confluence.xhtml.api.MacroDefinition;
import com.atlassian.confluence.xhtml.api.XhtmlContent;
import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import com.atlassian.renderer.RenderContext;
import com.google.common.collect.ImmutableMap;
import org.springframework.beans.factory.annotation.Autowired;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;
import java.util.Optional;

import static com.atlassian.confluence.api.model.validation.ServiceExceptionSupplier.notFound;

@Path("/content")
public class ContentResource {

    private final ContentService contentService;
    private final XhtmlContent xhtmlContent;

    @Autowired
    public ContentResource(
            @ComponentImport final ContentService contentService,
            @ComponentImport final XhtmlContent xhtmlContent
    ) {
        this.contentService = contentService;
        this.xhtmlContent = xhtmlContent;
    }

    @GET
    @Path("/{id}")
    @Produces("application/json")
    public Response get(@PathParam("id") final long contentId) {
        return contentService.find(ExpansionsParser.parse("body.storage")).withId(ContentId.of(contentId)).fetch()
                .map(content -> Response.ok(content).build())
                .orElseThrow(notFound("content not found for id: " + contentId));
    }

    @GET
    @Path("/{id}/macros")
    @Produces("application/json")
    public Response getMacros(@PathParam("id") final long contentId) {
        final String contentBody = contentService.find(ExpansionsParser.parse("body.storage")).withId(ContentId.of(contentId)).fetch()
                .map(content -> content.getBody().get(ContentRepresentation.STORAGE).getValue())
                .orElseThrow(notFound("content not found for id: " + contentId));

        final Collection<Map<String, Object>> macroDefinitions = new ArrayList<>();
        try {
            xhtmlContent.handleMacroDefinitions(
                    contentBody,
                    new DefaultConversionContext(new RenderContext()),
                    (macro) -> macroDefinitions.add(
                            ImmutableMap.<String, Object>builder()
                                    .put("name", macro.getName())
                                    .put("macroId", macro.getMacroIdentifier().orElse(MacroId.fromString("none")).getId())
                                    .put("parameters", macro.getParameters())
                                    .put("body.text", macro.getBodyText())
                                    .put("body.type", macro.getBodyType())
                                    .put("valid", macro.isValid())
                                    .put("schema.version", macro.getSchemaVersion())
                                    .build()
                    )
            );
            return Response.ok(macroDefinitions).build();
        } catch (XhtmlException exception) {
            return Response.serverError().entity(exception.getMessage()).build();
        }
    }
}
