package it.rest.devbox.confluence;

import com.atlassian.confluence.test.rest.api.ConfluenceRestClient;
import com.atlassian.confluence.test.stateless.ConfluenceStatelessRestTestRunner;
import com.atlassian.confluence.test.stateless.fixtures.Fixture;
import com.atlassian.confluence.test.stateless.fixtures.UserFixture;
import com.sun.jersey.api.client.ClientResponse;
import org.junit.Test;
import org.junit.runner.RunWith;

import javax.inject.Inject;
import javax.ws.rs.core.Response;

import static com.atlassian.confluence.test.stateless.fixtures.UserFixture.userFixture;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;

@RunWith(ConfluenceStatelessRestTestRunner.class)
public class HealthCheckResourceStatelessTest {

    private static final String HEALTH_CHECK_DEVBOX_ENDPOINT = "/rest/devbox/latest/health-check";

    @Inject
    private static ConfluenceRestClient restClient;

    @Fixture
    private static final UserFixture user = userFixture().build();

    @Test
    public void ping200OK() {
        ClientResponse response = restClient.createSession(user.get())
                .resource(HEALTH_CHECK_DEVBOX_ENDPOINT + "/ping")
                .head();
        assertThat(response.getStatusInfo().getStatusCode(), equalTo(Response.Status.OK.getStatusCode()));
    }
}
