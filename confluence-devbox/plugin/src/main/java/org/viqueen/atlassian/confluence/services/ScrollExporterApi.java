package org.viqueen.atlassian.confluence.services;

import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import com.k15t.scroll.exporter.api.word.WordExportService;
import com.k15t.scroll.exporter.api.word.WordTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ScrollExporterApi {

    @Autowired
    @ComponentImport
    private WordExportService wordExportService;

    @Autowired
    @ComponentImport
    private WordTemplateService wordTemplateService;

    @Override
    public String toString() {
        return "ScrollExporterApi{" +
                "wordExportService=" + wordExportService +
                ", wordTemplateService=" + wordTemplateService +
                '}';
    }
}
