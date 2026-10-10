package com.example.projectname.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.example.projectname.common.exception.ResourceNotFoundException;
import com.example.projectname.common.paging.PageResponse;
import com.example.projectname.support.H2SpringBootTest;
import com.example.projectname.user.dto.RegisterRequest;
import com.example.projectname.user.dto.UserSummary;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

/** Exercises {@code BaseRepository} helpers and the paging DTO against a real JPA repository. */
@H2SpringBootTest
class UserPagingTest {

  @Autowired private UserService userService;
  @Autowired private UserRepository userRepository;

  @Test
  void findPageReturnsRequestedSliceInSortOrder() {
    String suffix = UUID.randomUUID().toString().substring(0, 8);
    for (String letter : new String[] {"a", "b", "c"}) {
      userService.register(
          new RegisterRequest(
              "paging-" + letter + "-" + suffix + "@example.test",
              "Password123!",
              "Paging",
              letter.toUpperCase()));
    }

    PageResponse<UserSummary> page =
        userService.findPage(PageRequest.of(0, 2, Sort.by("email").ascending()));

    assertThat(page.items()).hasSize(2);
    assertThat(page.size()).isEqualTo(2);
    assertThat(page.totalItems()).isGreaterThanOrEqualTo(3);
    assertThat(page.totalPages()).isGreaterThanOrEqualTo(2);
    assertThat(page.items().get(0).email()).isLessThan(page.items().get(1).email());
  }

  @Test
  void getOrThrowNamesTheMissingEntity() {
    assertThatThrownBy(() -> userRepository.getOrThrow(-1L, "User"))
        .isInstanceOf(ResourceNotFoundException.class)
        .hasMessage("User not found with id -1");
  }
}
