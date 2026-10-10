package com.example.projectname.common.exception;

/** Raised when a refresh token is unknown, expired, revoked or belongs to a disabled account. */
public class InvalidRefreshTokenException extends RuntimeException {

  public InvalidRefreshTokenException(String message) {
    super(message);
  }
}
