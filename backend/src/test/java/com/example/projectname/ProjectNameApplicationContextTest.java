package com.example.projectname;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.projectname.support.H2SpringBootTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;

/**
 * The whole real Spring context boots. This catches a whole class of wiring bug that mocked unit
 * tests cannot: bean graph errors (for example a circular dependency between the security
 * configuration and the beans it injects) and configuration that is silently missing from the test
 * classpath, because {@code src/test/resources/application.yml} shadows the main one.
 */
@H2SpringBootTest
class ProjectNameApplicationContextTest {

  @Autowired private ClientRegistrationRepository clientRegistrationRepository;

  @Test
  void contextLoads() {
    // Reaching this point already proves the whole bean graph, including both SecurityConfig
    // filter chains and the OIDC handlers, wired up without error.
  }

  @Test
  void keycloakClientRegistrationIsConfigured() {
    ClientRegistration registration = clientRegistrationRepository.findByRegistrationId("keycloak");

    assertThat(registration).isNotNull();
    assertThat(registration.getClientId()).isNotBlank();
    assertThat(registration.getClientSecret()).isNotBlank();
  }
}
