package com.example.projectname.user;

import com.example.projectname.common.BaseEntity;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.util.HashSet;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class User extends BaseEntity {

  @Column(nullable = false, unique = true, length = 190)
  private String email;

  @Column(name = "password_hash", nullable = false)
  private String passwordHash;

  @Column(name = "first_name", nullable = false, length = 80)
  private String firstName;

  @Column(name = "last_name", nullable = false, length = 80)
  private String lastName;

  @Column(nullable = false)
  @Builder.Default
  private boolean active = true;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
  @Enumerated(EnumType.STRING)
  @Column(name = "role", nullable = false, length = 40)
  @Builder.Default
  private Set<RoleName> roles = new HashSet<>();

  /** Non-null once this user has signed in via OIDC at least once, e.g. {@code "keycloak"}. */
  @Column(name = "oidc_provider", length = 60)
  private String oidcProvider;

  /**
   * The identity provider's stable subject ({@code sub} claim), unique per {@link #oidcProvider}.
   */
  @Column(name = "oidc_subject")
  private String oidcSubject;

  public String getFullName() {
    return firstName + " " + lastName;
  }
}
