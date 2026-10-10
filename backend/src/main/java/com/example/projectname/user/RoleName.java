package com.example.projectname.user;

/**
 * Roles recognized by the application. Names are stored with the {@code ROLE_} prefix so they can
 * be used directly with Spring Security's {@code hasRole(...)} expressions (which add the prefix
 * implicitly) as well as {@code hasAuthority(...)} checks.
 *
 * <p>Add roles here and in the {@code user_roles} data your migrations seed; keep the set small.
 */
public enum RoleName {
  ROLE_ADMIN,
  ROLE_USER
}
