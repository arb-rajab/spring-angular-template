package com.example.projectname.common.paging;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

class PageParamsTest {

  private static final Set<String> ALLOWED = Set.of("email", "createdAt");
  private static final Sort DEFAULT_SORT = Sort.by("createdAt").descending();

  @Test
  void usesDefaultsWhenNothingIsRequested() {
    Pageable pageable = PageParams.of(null, null, null, ALLOWED, DEFAULT_SORT);

    assertThat(pageable.getPageNumber()).isZero();
    assertThat(pageable.getPageSize()).isEqualTo(PageParams.DEFAULT_SIZE);
    assertThat(pageable.getSort()).isEqualTo(DEFAULT_SORT);
  }

  @Test
  void clampsSizeAndNegativePage() {
    assertThat(PageParams.of(-5, 100_000, null, ALLOWED, DEFAULT_SORT).getPageSize())
        .isEqualTo(PageParams.MAX_SIZE);
    assertThat(PageParams.of(-5, 10, null, ALLOWED, DEFAULT_SORT).getPageNumber()).isZero();
    assertThat(PageParams.of(0, 0, null, ALLOWED, DEFAULT_SORT).getPageSize())
        .isEqualTo(PageParams.DEFAULT_SIZE);
  }

  @Test
  void parsesSortPropertyAndDirection() {
    Pageable asc = PageParams.of(0, 10, "email", ALLOWED, DEFAULT_SORT);
    Pageable desc = PageParams.of(0, 10, "email,desc", ALLOWED, DEFAULT_SORT);

    assertThat(asc.getSort().getOrderFor("email").getDirection()).isEqualTo(Sort.Direction.ASC);
    assertThat(desc.getSort().getOrderFor("email").getDirection()).isEqualTo(Sort.Direction.DESC);
  }

  @Test
  void rejectsASortPropertyThatIsNotAllowListed() {
    assertThatThrownBy(() -> PageParams.of(0, 10, "passwordHash", ALLOWED, DEFAULT_SORT))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("passwordHash");
  }
}
