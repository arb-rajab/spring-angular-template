package com.example.projectname.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AccountStatusException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final String INVALID_CREDENTIALS = "Invalid email or password";

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ApiError> handleNotFound(
      ResourceNotFoundException ex, HttpServletRequest request) {
    return build(HttpStatus.NOT_FOUND, ex.getMessage(), request, Map.of());
  }

  @ExceptionHandler(DuplicateResourceException.class)
  public ResponseEntity<ApiError> handleDuplicate(
      DuplicateResourceException ex, HttpServletRequest request) {
    return build(HttpStatus.CONFLICT, ex.getMessage(), request, Map.of());
  }

  @ExceptionHandler(BadCredentialsException.class)
  public ResponseEntity<ApiError> handleBadCredentials(
      BadCredentialsException ex, HttpServletRequest request) {
    return build(HttpStatus.UNAUTHORIZED, INVALID_CREDENTIALS, request, Map.of());
  }

  /**
   * Thrown by {@code AuthenticationManager} for a deactivated (or locked/expired) account. Mapped
   * to the same response as bad credentials, deliberately not a distinct message: telling an
   * unauthenticated caller "this account is disabled" would leak account existence and status.
   */
  @ExceptionHandler(AccountStatusException.class)
  public ResponseEntity<ApiError> handleAccountStatus(
      AccountStatusException ex, HttpServletRequest request) {
    return build(HttpStatus.UNAUTHORIZED, INVALID_CREDENTIALS, request, Map.of());
  }

  @ExceptionHandler(InvalidRefreshTokenException.class)
  public ResponseEntity<ApiError> handleInvalidRefreshToken(
      InvalidRefreshTokenException ex, HttpServletRequest request) {
    return build(HttpStatus.UNAUTHORIZED, ex.getMessage(), request, Map.of());
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ApiError> handleAccessDenied(
      AccessDeniedException ex, HttpServletRequest request) {
    return build(
        HttpStatus.FORBIDDEN,
        "You do not have permission to perform this action",
        request,
        Map.of());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiError> handleValidation(
      MethodArgumentNotValidException ex, HttpServletRequest request) {
    Map<String, List<String>> fieldErrors = new LinkedHashMap<>();
    for (FieldError error : ex.getBindingResult().getFieldErrors()) {
      fieldErrors
          .computeIfAbsent(error.getField(), key -> new ArrayList<>())
          .add(error.getDefaultMessage() == null ? "is invalid" : error.getDefaultMessage());
    }
    return build(HttpStatus.BAD_REQUEST, "Validation failed", request, fieldErrors);
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<ApiError> handleUnreadableBody(
      HttpMessageNotReadableException ex, HttpServletRequest request) {
    return build(HttpStatus.BAD_REQUEST, "Malformed request body", request, Map.of());
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ApiError> handleIllegalArgument(
      IllegalArgumentException ex, HttpServletRequest request) {
    return build(HttpStatus.BAD_REQUEST, ex.getMessage(), request, Map.of());
  }

  private ResponseEntity<ApiError> build(
      HttpStatus status,
      String message,
      HttpServletRequest request,
      Map<String, List<String>> fieldErrors) {
    ApiError body =
        ApiError.of(
            status.value(),
            status.getReasonPhrase(),
            message,
            request.getRequestURI(),
            fieldErrors);
    return ResponseEntity.status(status).body(body);
  }
}
