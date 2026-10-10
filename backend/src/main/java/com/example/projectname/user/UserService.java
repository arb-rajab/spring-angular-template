package com.example.projectname.user;

import com.example.projectname.common.exception.DuplicateResourceException;
import com.example.projectname.common.exception.ResourceNotFoundException;
import com.example.projectname.common.paging.PageResponse;
import com.example.projectname.user.dto.RegisterRequest;
import com.example.projectname.user.dto.UserSummary;
import java.util.EnumSet;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  @Transactional
  public User register(RegisterRequest request) {
    if (userRepository.existsByEmailIgnoreCase(request.email())) {
      throw new DuplicateResourceException(
          "An account with email " + request.email() + " already exists");
    }
    User user =
        User.builder()
            .email(request.email().toLowerCase(Locale.ROOT))
            .passwordHash(passwordEncoder.encode(request.password()))
            .firstName(request.firstName())
            .lastName(request.lastName())
            .active(true)
            .roles(EnumSet.of(RoleName.ROLE_USER))
            .build();
    return userRepository.save(user);
  }

  public User findById(Long id) {
    return userRepository.getOrThrow(id, "User");
  }

  public User findByEmail(String email) {
    return userRepository
        .findByEmailIgnoreCase(email)
        .orElseThrow(() -> new ResourceNotFoundException("No user found with email " + email));
  }

  /**
   * Finds or creates the local user for an OIDC login, linking by email.
   *
   * <p>An OIDC login links onto an existing password-based account with the same email instead of
   * creating a second, disconnected identity, and never touches that account's password hash. A
   * brand-new account gets a random, unguessable BCrypt hash that is never handed to anyone, so the
   * password login path needs no null-password special case: it just reports bad credentials, as it
   * would for any wrong password.
   *
   * <p>Linking by email is only safe when the identity provider verifies email ownership. Review
   * that assumption before pointing this at a provider that does not.
   */
  @Transactional
  public User findOrProvisionForOidc(
      String provider, String subject, String email, String firstName, String lastName) {
    User user =
        userRepository
            .findByEmailIgnoreCase(email)
            .orElseGet(
                () ->
                    User.builder()
                        .email(email.toLowerCase(Locale.ROOT))
                        .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .firstName(firstName)
                        .lastName(lastName)
                        .active(true)
                        .roles(EnumSet.of(RoleName.ROLE_USER))
                        .build());
    user.setOidcProvider(provider);
    user.setOidcSubject(subject);
    return userRepository.save(user);
  }

  public PageResponse<UserSummary> findPage(Pageable pageable) {
    return userRepository.findPage(pageable, UserSummary::from);
  }

  @Transactional
  public User replaceRoles(Long id, Set<RoleName> roles) {
    User user = findById(id);
    user.setRoles(EnumSet.copyOf(roles));
    return user;
  }

  @Transactional
  public User setActive(Long id, boolean active) {
    User user = findById(id);
    user.setActive(active);
    return user;
  }
}
