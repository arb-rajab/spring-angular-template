package com.example.projectname.user;

import com.example.projectname.common.paging.PageParams;
import com.example.projectname.common.paging.PageResponse;
import com.example.projectname.user.dto.UpdateRolesRequest;
import com.example.projectname.user.dto.UserSummary;
import jakarta.validation.Valid;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

  private static final Set<String> SORTABLE = Set.of("email", "firstName", "lastName", "createdAt");

  private final UserService userService;

  @GetMapping("/me")
  public UserSummary me(Authentication authentication) {
    return UserSummary.from(userService.findByEmail(authentication.getName()));
  }

  /** Paginated user list: {@code ?page=0&size=20&sort=email,asc}. */
  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  public PageResponse<UserSummary> findAll(
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size,
      @RequestParam(required = false) String sort) {
    return userService.findPage(
        PageParams.of(page, size, sort, SORTABLE, Sort.by("createdAt").descending()));
  }

  @PutMapping("/{id}/roles")
  @PreAuthorize("hasRole('ADMIN')")
  public UserSummary updateRoles(
      @PathVariable Long id, @Valid @RequestBody UpdateRolesRequest request) {
    return UserSummary.from(userService.replaceRoles(id, request.roles()));
  }
}
