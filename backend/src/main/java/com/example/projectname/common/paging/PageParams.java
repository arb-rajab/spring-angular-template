package com.example.projectname.common.paging;

import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Turns raw {@code page}/{@code size}/{@code sort} query parameters into a safe {@link Pageable}.
 *
 * <p>Page numbers are zero-based. Size is clamped to {@link #MAX_SIZE} so a client cannot request
 * an unbounded result set, and the sort property must be on the caller's allow-list so a client
 * cannot sort by (or probe the existence of) an arbitrary column.
 */
public final class PageParams {

  public static final int DEFAULT_SIZE = 20;
  public static final int MAX_SIZE = 100;

  private PageParams() {}

  /**
   * @param page zero-based page index; negative values are treated as 0
   * @param size page size; values below 1 fall back to {@link #DEFAULT_SIZE}, values above {@link
   *     #MAX_SIZE} are clamped
   * @param sort {@code property} or {@code property,asc|desc}; null or blank means {@code
   *     defaultSort}
   * @param allowedSortProperties properties a client may sort by
   * @param defaultSort used when no sort is requested
   * @throws IllegalArgumentException when the requested sort property is not allowed
   */
  public static Pageable of(
      Integer page,
      Integer size,
      String sort,
      Set<String> allowedSortProperties,
      Sort defaultSort) {
    int safePage = page == null ? 0 : Math.max(page, 0);
    int safeSize = size == null || size < 1 ? DEFAULT_SIZE : Math.min(size, MAX_SIZE);
    return PageRequest.of(safePage, safeSize, parseSort(sort, allowedSortProperties, defaultSort));
  }

  private static Sort parseSort(String sort, Set<String> allowed, Sort defaultSort) {
    if (sort == null || sort.isBlank()) {
      return defaultSort;
    }
    String[] parts = sort.split(",", 2);
    String property = parts[0].trim();
    if (!allowed.contains(property)) {
      throw new IllegalArgumentException("Cannot sort by '" + property + "'");
    }
    Sort.Direction direction =
        parts.length > 1 && "desc".equalsIgnoreCase(parts[1].trim())
            ? Sort.Direction.DESC
            : Sort.Direction.ASC;
    return Sort.by(direction, property);
  }
}
