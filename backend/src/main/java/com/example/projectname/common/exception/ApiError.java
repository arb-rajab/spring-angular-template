package com.example.projectname.common.exception;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Uniform error payload returned to API clients.
 *
 * <p>{@code details} is a flat, human-readable list. {@code fieldErrors} maps a request field name
 * to its validation messages so a form can show each message next to the matching input; it is
 * empty for errors that are not about a specific field.
 */
public record ApiError(
    Instant timestamp,
    int status,
    String error,
    String message,
    String path,
    List<String> details,
    Map<String, List<String>> fieldErrors) {

  public static ApiError of(
      int status,
      String error,
      String message,
      String path,
      Map<String, List<String>> fieldErrors) {
    List<String> details =
        fieldErrors.entrySet().stream()
            .flatMap(
                entry ->
                    entry.getValue().stream().map(message_ -> entry.getKey() + ": " + message_))
            .toList();
    return new ApiError(Instant.now(), status, error, message, path, details, fieldErrors);
  }
}
