package com.example.projectname.common.exception;

/** Raised when creating a resource would violate a uniqueness rule. Mapped to HTTP 409. */
public class DuplicateResourceException extends RuntimeException {

  public DuplicateResourceException(String message) {
    super(message);
  }
}
