package com.example.projectname.auth;

import com.example.projectname.support.AbstractIntegrationTest;
import dasniko.testcontainers.keycloak.KeycloakContainer;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

/**
 * Base class for OIDC integration tests: a real, local Keycloak container, seeded from the exact
 * realm import committed at {@code keycloak/project-name-realm.json} (copied to this module's test
 * resources - see {@code keycloak/README.md}), standing in for the identity provider a real
 * deployment would point at. No mock IdP and no stubbed token issuer.
 *
 * <p>Started once in a static initializer, same "singleton container" reasoning as {@link
 * AbstractIntegrationTest}'s Postgres container: subclasses share one running Keycloak rather than
 * each restarting it on a new port.
 */
abstract class AbstractOidcIntegrationTest extends AbstractIntegrationTest {

  private static final String REALM = "project-name";
  static final String TEST_USER_NEW_EMAIL = "sso.newhire@example.test";
  static final String TEST_USER_EXISTING_EMAIL = "existing.user@example.test";
  private static final String TEST_USER_PASSWORD = "Password123!";
  private static final String CLIENT_ID = "project-name-backend";
  private static final String CLIENT_SECRET = "project-name-dev-secret";

  static final KeycloakContainer KEYCLOAK =
      new KeycloakContainer("quay.io/keycloak/keycloak:26.0")
          .withRealmImportFile("/keycloak/project-name-realm.json");

  static {
    KEYCLOAK.start();
  }

  @DynamicPropertySource
  static void oidcProperties(DynamicPropertyRegistry registry) {
    String base = KEYCLOAK.getAuthServerUrl() + "/realms/" + REALM + "/protocol/openid-connect/";
    registry.add(
        "spring.security.oauth2.client.registration.keycloak.client-secret", () -> CLIENT_SECRET);
    registry.add(
        "spring.security.oauth2.client.provider.keycloak.authorization-uri", () -> base + "auth");
    registry.add("spring.security.oauth2.client.provider.keycloak.token-uri", () -> base + "token");
    registry.add(
        "spring.security.oauth2.client.provider.keycloak.jwk-set-uri", () -> base + "certs");
    registry.add(
        "spring.security.oauth2.client.provider.keycloak.user-info-uri", () -> base + "userinfo");
  }

  /**
   * Obtains a real, Keycloak-signed ID token for one of the realm's seeded test users via the
   * Resource Owner Password Credentials grant - enabled on this dev-only realm's client purely so
   * tests can get a genuine token without scripting a browser through Keycloak's login form (see
   * {@code keycloak/README.md}). A real user's browser only ever goes through the authorization
   * -code redirect that {@code oauth2Login} drives.
   */
  static String fetchRealIdToken(String username) {
    try {
      String base = KEYCLOAK.getAuthServerUrl() + "/realms/" + REALM + "/protocol/openid-connect/";
      String form =
          "grant_type=password"
              + "&client_id="
              + CLIENT_ID
              + "&client_secret="
              + CLIENT_SECRET
              + "&username="
              + username
              + "&password="
              + TEST_USER_PASSWORD
              + "&scope=openid+profile+email";
      HttpRequest request =
          HttpRequest.newBuilder(URI.create(base + "token"))
              .timeout(Duration.ofSeconds(10))
              .header("Content-Type", "application/x-www-form-urlencoded")
              .POST(HttpRequest.BodyPublishers.ofString(form, StandardCharsets.UTF_8))
              .build();
      HttpResponse<String> response =
          HttpClient.newHttpClient().send(request, BodyHandlers.ofString());
      if (response.statusCode() != 200) {
        throw new IllegalStateException(
            "Keycloak token endpoint returned " + response.statusCode() + ": " + response.body());
      }
      @SuppressWarnings("unchecked")
      Map<String, Object> body =
          tools.jackson.databind.json.JsonMapper.builder()
              .build()
              .readValue(response.body(), Map.class);
      return (String) body.get("id_token");
    } catch (IOException | InterruptedException e) {
      throw new IllegalStateException("Could not fetch a token from the test Keycloak", e);
    }
  }

  /**
   * Decodes a JWT's claims without verifying its signature - fine here because the token was just
   * fetched, over a direct connection, from the trusted test container itself; the point is to read
   * the real claims Keycloak put in it, not to re-test JWT signature verification (that's covered
   * elsewhere, e.g. JwtServiceTest, for our own tokens).
   */
  @SuppressWarnings("unchecked")
  static Map<String, Object> decodeClaimsWithoutVerifying(String jwt) {
    try {
      String payload = jwt.split("\\.")[1];
      byte[] decoded = java.util.Base64.getUrlDecoder().decode(payload);
      return tools.jackson.databind.json.JsonMapper.builder().build().readValue(decoded, Map.class);
    } catch (RuntimeException e) {
      throw new IllegalStateException("Could not decode the test id_token", e);
    }
  }
}
