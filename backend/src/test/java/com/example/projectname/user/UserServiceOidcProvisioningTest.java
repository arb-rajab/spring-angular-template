package com.example.projectname.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.EnumSet;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Unit coverage for the identity-linking decision: an OIDC login links onto an existing
 * password-based account with the same email rather than creating a second, disconnected identity,
 * and never touches that account's existing password hash while doing so, so the password login
 * path for the same user is completely unaffected. The full round trip against a real Keycloak
 * container lives in {@code OidcLoginProvisioningIT}; this class isolates just the linking/creation
 * decision so it runs in {@code mvn test} with no Docker involved.
 */
@ExtendWith(MockitoExtension.class)
class UserServiceOidcProvisioningTest {

  private static final String PROVIDER = "keycloak";
  private static final String NEW_SUBJECT = "kc-subject-123";
  private static final String LINKED_SUBJECT = "kc-subject-456";

  @Mock private UserRepository userRepository;
  @Mock private PasswordEncoder passwordEncoder;

  private UserService userService;

  @org.junit.jupiter.api.BeforeEach
  void setUp() {
    userService = new UserService(userRepository, passwordEncoder);
  }

  @Test
  void provisionsANewUserWhenNoAccountHasThatEmail() {
    when(userRepository.findByEmailIgnoreCase("sso.newhire@example.test"))
        .thenReturn(Optional.empty());
    when(passwordEncoder.encode(any())).thenReturn("$2a$10$unguessable-random-hash");
    when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

    User user =
        userService.findOrProvisionForOidc(
            PROVIDER, NEW_SUBJECT, "sso.newhire@example.test", "Sasha", "Newhire");

    assertThat(user.getEmail()).isEqualTo("sso.newhire@example.test");
    assertThat(user.getOidcProvider()).isEqualTo(PROVIDER);
    assertThat(user.getOidcSubject()).isEqualTo(NEW_SUBJECT);
    assertThat(user.getRoles()).containsExactly(RoleName.ROLE_USER);
    assertThat(user.isActive()).isTrue();
    assertThat(user.getPasswordHash()).isEqualTo("$2a$10$unguessable-random-hash");
  }

  @Test
  void linksAnExistingJwtRegisteredUserByEmailWithoutTouchingItsPassword() {
    User existing =
        User.builder()
            .email("existing.user@example.test")
            .passwordHash("$2a$10$original-bcrypt-hash-from-registration")
            .firstName("Erin")
            .lastName("Existing")
            .active(true)
            .roles(EnumSet.of(RoleName.ROLE_ADMIN))
            .build();
    when(userRepository.findByEmailIgnoreCase("existing.user@example.test"))
        .thenReturn(Optional.of(existing));
    when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

    User linked =
        userService.findOrProvisionForOidc(
            PROVIDER, LINKED_SUBJECT, "existing.user@example.test", "Erin", "Existing");

    assertThat(linked).isSameAs(existing);
    assertThat(linked.getOidcProvider()).isEqualTo(PROVIDER);
    assertThat(linked.getOidcSubject()).isEqualTo(LINKED_SUBJECT);
    // The whole point: linking must not touch the password JWT login still relies on.
    assertThat(linked.getPasswordHash()).isEqualTo("$2a$10$original-bcrypt-hash-from-registration");
    assertThat(linked.getRoles()).containsExactly(RoleName.ROLE_ADMIN);
    verify(passwordEncoder, never()).encode(any());
  }
}
