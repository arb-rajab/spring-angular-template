package com.example.projectname.user.dto;

public record AuthResponse(
    String accessToken,
    String tokenType,
    long expiresInSeconds,
    String refreshToken,
    UserSummary user) {

  public static AuthResponse bearer(
      String accessToken, long expiresInSeconds, String refreshToken, UserSummary user) {
    return new AuthResponse(accessToken, "Bearer", expiresInSeconds, refreshToken, user);
  }
}
