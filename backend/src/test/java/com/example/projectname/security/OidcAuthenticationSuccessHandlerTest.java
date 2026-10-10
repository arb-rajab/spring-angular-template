package com.example.projectname.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.example.projectname.security.RefreshTokenService.IssuedRefreshToken;
import com.example.projectname.user.RoleName;
import com.example.projectname.user.User;
import com.example.projectname.user.UserService;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

/**
 * Proves a deactivated user cannot complete SSO login. {@link OidcAuthenticationSuccessHandler}
 * never routes through {@code AuthenticationManager}, so it does not get the {@code
 * UserPrincipal.isEnabled()} check password login gets for free; it must run the account-status
 * check itself and must not mint tokens when it fails.
 */
@ExtendWith(MockitoExtension.class)
class OidcAuthenticationSuccessHandlerTest {

  @Mock private UserService userService;
  @Mock private JwtService jwtService;
  @Mock private RefreshTokenService refreshTokenService;

  private OidcAuthenticationSuccessHandler handler;
  private MockHttpServletRequest request;
  private MockHttpServletResponse response;

  @BeforeEach
  void setUp() {
    OidcProperties oidcProperties = new OidcProperties();
    oidcProperties.setFrontendRedirectUri("http://localhost:4200/sso/callback");
    handler =
        new OidcAuthenticationSuccessHandler(
            userService, jwtService, refreshTokenService, oidcProperties);
    request = new MockHttpServletRequest();
    response = new MockHttpServletResponse();
  }

  @Test
  void deactivatedUserIsBlockedInsteadOfIssuedTokens() throws Exception {
    User deactivated = seededUser(false);
    when(userService.findOrProvisionForOidc(
            anyString(), anyString(), anyString(), anyString(), anyString()))
        .thenReturn(deactivated);

    handler.onAuthenticationSuccess(
        request, response, authenticationFor("deactivated@example.test", "sub-1"));

    assertThat(response.getRedirectedUrl()).contains("error=account_deactivated");
    assertThat(response.getRedirectedUrl()).doesNotContain("token=");
    verifyNoInteractions(jwtService);
    verifyNoInteractions(refreshTokenService);
  }

  @Test
  void activeUserStillGetsATokenPairAfterTheFix() throws Exception {
    User active = seededUser(true);
    when(userService.findOrProvisionForOidc(
            anyString(), anyString(), anyString(), anyString(), anyString()))
        .thenReturn(active);
    when(jwtService.generateAccessToken(any(), anyString(), any())).thenReturn("access-token");
    when(jwtService.accessTokenTtlSeconds()).thenReturn(1800L);
    when(refreshTokenService.issue(active))
        .thenReturn(new IssuedRefreshToken("refresh-token", Instant.now().plusSeconds(3600)));

    handler.onAuthenticationSuccess(
        request, response, authenticationFor("active@example.test", "sub-2"));

    assertThat(response.getRedirectedUrl()).contains("token=access-token");
    assertThat(response.getRedirectedUrl()).contains("refreshToken=refresh-token");
  }

  private User seededUser(boolean active) {
    User user =
        User.builder()
            .email("user@example.test")
            .firstName("Test")
            .lastName("User")
            .active(active)
            .roles(EnumSet.of(RoleName.ROLE_USER))
            .build();
    user.setId(42L);
    return user;
  }

  private OAuth2AuthenticationToken authenticationFor(String email, String subject) {
    OidcIdToken idToken =
        new OidcIdToken(
            "id-token-value",
            Instant.now(),
            Instant.now().plusSeconds(300),
            Map.of("sub", subject, "email", email));
    OidcUser oidcUser =
        new DefaultOidcUser(List.of(new SimpleGrantedAuthority("ROLE_USER")), idToken);
    return new OAuth2AuthenticationToken(oidcUser, oidcUser.getAuthorities(), "keycloak");
  }
}
