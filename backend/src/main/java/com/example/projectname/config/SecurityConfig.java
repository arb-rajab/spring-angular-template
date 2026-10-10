package com.example.projectname.config;

import com.example.projectname.ratelimit.RateLimitFilter;
import com.example.projectname.ratelimit.RateLimitProperties;
import com.example.projectname.security.JwtAuthenticationFilter;
import com.example.projectname.security.JwtProperties;
import com.example.projectname.security.JwtService;
import com.example.projectname.security.OidcAuthenticationFailureHandler;
import com.example.projectname.security.OidcAuthenticationSuccessHandler;
import com.example.projectname.security.OidcProperties;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Security configuration: two independent filter chains, so the OIDC login handshake (which needs
 * an {@code HttpSession} to hold its redirect state and nonce, per the OAuth2 spec) cannot weaken
 * the stateless JWT API.
 *
 * <ul>
 *   <li>{@link #oidcFilterChain} ({@code @Order(1)}), matching only {@code /oauth2/**} and {@code
 *       /login/**}: Spring's {@code oauth2Login}, sessions allowed.
 *   <li>{@link #apiFilterChain} ({@code @Order(2)}, everything else): stateless, {@link
 *       JwtAuthenticationFilter} only. Access tokens are short-lived JWTs; refresh tokens are
 *       opaque, stored hashed and revocable.
 * </ul>
 *
 * <p>{@link PasswordEncoderConfig} holds the {@code PasswordEncoder} bean separately from this
 * class to avoid a circular dependency: this class constructor-injects {@link
 * OidcAuthenticationSuccessHandler}, which needs {@code UserService}, which needs a {@code
 * PasswordEncoder}.
 */
@Configuration
@EnableMethodSecurity
@EnableConfigurationProperties({
  JwtProperties.class,
  OidcProperties.class,
  RateLimitProperties.class
})
@RequiredArgsConstructor
public class SecurityConfig {

  private final JwtService jwtService;
  private final CorsProperties corsProperties;
  private final OidcAuthenticationSuccessHandler oidcAuthenticationSuccessHandler;
  private final OidcAuthenticationFailureHandler oidcAuthenticationFailureHandler;
  private final RateLimitFilter rateLimitFilter;

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration)
      throws Exception {
    return configuration.getAuthenticationManager();
  }

  @Bean
  @Order(1)
  public SecurityFilterChain oidcFilterChain(HttpSecurity http) throws Exception {
    // CSRF stays on (Spring's default) here: unlike the API chain, this chain keeps an
    // HttpSession, and every endpoint it serves is a GET, so enabling it costs nothing.
    http.securityMatcher("/oauth2/**", "/login/**")
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
        .oauth2Login(
            oauth2 ->
                oauth2
                    .successHandler(oidcAuthenticationSuccessHandler)
                    .failureHandler(oidcAuthenticationFailureHandler));
    return http.build();
  }

  @Bean
  @Order(2)
  public SecurityFilterChain apiFilterChain(HttpSecurity http) throws Exception {
    // CSRF is off by design: this chain is stateless and only trusts the Authorization header,
    // which a browser never attaches to a cross-site request.
    http.csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth ->
                auth.requestMatchers(
                        "/api/v1/auth/**",
                        "/actuator/health/**",
                        "/actuator/info",
                        "/v3/api-docs/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .addFilterBefore(
            new JwtAuthenticationFilter(jwtService), UsernamePasswordAuthenticationFilter.class)
        .addFilterBefore(rateLimitFilter, JwtAuthenticationFilter.class);
    return http.build();
  }

  private CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of(corsProperties.getAllowedOrigins().split(",")));
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    configuration.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }
}
