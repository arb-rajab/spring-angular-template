package com.example.projectname.user.dto;

import com.example.projectname.user.User;
import java.util.Set;
import java.util.stream.Collectors;

public record UserSummary(
    Long id, String email, String firstName, String lastName, boolean active, Set<String> roles) {

  public static UserSummary from(User user) {
    return new UserSummary(
        user.getId(),
        user.getEmail(),
        user.getFirstName(),
        user.getLastName(),
        user.isActive(),
        user.getRoles().stream().map(Enum::name).collect(Collectors.toSet()));
  }
}
