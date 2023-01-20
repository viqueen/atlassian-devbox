package org.viqueen.atlassian.confluence.events;

import com.atlassian.confluence.event.events.content.ContentRevertedEvent;
import com.atlassian.confluence.event.events.content.blogpost.BlogPostRestoreEvent;
import com.atlassian.confluence.event.events.content.page.PageRestoreEvent;
import com.atlassian.event.api.EventListener;
import com.atlassian.event.api.EventListenerRegistrar;
import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ContentEventsListener implements InitializingBean, DisposableBean {

    private final EventListenerRegistrar eventListenerRegistrar;

    @Autowired
    public ContentEventsListener(final @ComponentImport EventListenerRegistrar eventListenerRegistrar) {
        this.eventListenerRegistrar = eventListenerRegistrar;
    }

    @EventListener
    public void handlePageRestored(final PageRestoreEvent event) {
        System.out.printf("**** restored from trash %s\n", event);
    }

    @EventListener
    public void handleBlogRestored(final BlogPostRestoreEvent event) {
        System.out.printf("**** restored blog from trash %s\n", event);
    }

    @EventListener
    public void handleContentReverted(final ContentRevertedEvent event) {
        System.out.printf("***** restored content version from history %s\n", event);
    }

    @Override
    public void afterPropertiesSet() {
        this.eventListenerRegistrar.register(this);
    }

    @Override
    public void destroy() {
        this.eventListenerRegistrar.unregister(this);
    }
}
