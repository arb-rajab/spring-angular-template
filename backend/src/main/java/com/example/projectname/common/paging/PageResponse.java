package com.example.projectname.common.paging;

import java.util.List;
import java.util.function.Function;
import org.springframework.data.domain.Page;

/**
 * Stable JSON shape for every paginated endpoint. Deliberately independent of Spring Data's own
 * {@code Page} serialization so the API contract does not change with a framework upgrade.
 *
 * @param items the rows on this page
 * @param page zero-based page index
 * @param size requested page size
 * @param totalItems total rows across all pages
 * @param totalPages total number of pages
 */
public record PageResponse<T>(List<T> items, int page, int size, long totalItems, int totalPages) {

  public static <S, T> PageResponse<T> from(Page<S> page, Function<S, T> mapper) {
    return new PageResponse<>(
        page.getContent().stream().map(mapper).toList(),
        page.getNumber(),
        page.getSize(),
        page.getTotalElements(),
        page.getTotalPages());
  }

  public static <T> PageResponse<T> from(Page<T> page) {
    return from(page, Function.identity());
  }
}
