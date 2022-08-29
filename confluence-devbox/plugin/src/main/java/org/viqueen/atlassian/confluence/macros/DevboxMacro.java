package org.viqueen.atlassian.confluence.macros;

import com.atlassian.confluence.content.render.xhtml.ConversionContext;
import com.atlassian.confluence.content.render.xhtml.storage.macro.MacroId;
import com.atlassian.confluence.macro.Macro;
import com.atlassian.confluence.xhtml.api.MacroDefinition;

import java.util.Map;

public class DevboxMacro implements Macro {
    @Override
    public String execute(
            final Map<String, String> parameters,
            final String body,
            final ConversionContext context
    ) {
        MacroDefinition macroDefinition = (MacroDefinition) context.getProperty("macroDefinition");
        String macroId = macroDefinition.getMacroIdentifier().map(MacroId::getId).orElse(null);
        return String.format("<p>Devbox macroId=%s</p>", macroId);
    }

    @Override
    public BodyType getBodyType() {
        return BodyType.RICH_TEXT;
    }

    @Override
    public OutputType getOutputType() {
        return OutputType.INLINE;
    }
}
