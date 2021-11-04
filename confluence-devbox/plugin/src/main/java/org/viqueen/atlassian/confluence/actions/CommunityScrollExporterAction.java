package org.viqueen.atlassian.confluence.actions;

import com.atlassian.confluence.core.ConfluenceActionSupport;
import com.atlassian.confluence.labels.Label;
import com.atlassian.confluence.pages.AbstractPage;
import com.atlassian.confluence.pages.actions.PageAware;
import org.springframework.beans.factory.annotation.Autowired;
import org.viqueen.atlassian.confluence.services.ScrollExporterApi;

public class CommunityScrollExporterAction extends ConfluenceActionSupport implements PageAware {

    @Autowired
    private ScrollExporterApi scrollExporterApi;

    private AbstractPage page;

    @Override
    public String execute() {
        // use logger, but really this is just decor to double-check the autowiring works
        System.out.println(scrollExporterApi.toString());
        getLabelManager().addLabel(getPage(), new Label("community-scroll"));
        return "success";
    }

    @Override
    public AbstractPage getPage() {
        return page;
    }

    @Override
    public void setPage(final AbstractPage abstractPage) {
        this.page = abstractPage;
    }

    @Override
    public boolean isPageRequired() {
        return true;
    }

    @Override
    public boolean isLatestVersionRequired() {
        return false;
    }

    @Override
    public boolean isViewPermissionRequired() {
        return true;
    }

}
