package com.example.projectname.common.paging;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

class PageResponseTest {

  @Test
  void mapsContentAndCopiesPagingMetadata() {
    var page = new PageImpl<>(List.of(1, 2, 3), PageRequest.of(1, 3), 8);

    PageResponse<String> response = PageResponse.from(page, n -> "n" + n);

    assertThat(response.items()).containsExactly("n1", "n2", "n3");
    assertThat(response.page()).isEqualTo(1);
    assertThat(response.size()).isEqualTo(3);
    assertThat(response.totalItems()).isEqualTo(8);
    assertThat(response.totalPages()).isEqualTo(3);
  }

  @Test
  void identityOverloadKeepsItems() {
    var page = new PageImpl<>(List.of("a"), PageRequest.of(0, 10), 1);

    assertThat(PageResponse.from(page).items()).containsExactly("a");
  }
}
