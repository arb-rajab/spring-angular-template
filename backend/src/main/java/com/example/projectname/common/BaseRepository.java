package com.example.projectname.common;

import com.example.projectname.common.exception.ResourceNotFoundException;
import com.example.projectname.common.paging.PageResponse;
import java.util.function.Function;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

/**
 * Base for every repository: JPA CRUD plus two helpers that otherwise get copy-pasted into every
 * service.
 */
@NoRepositoryBean
public interface BaseRepository<T extends BaseEntity> extends JpaRepository<T, Long> {

  /** Loads by id or throws {@link ResourceNotFoundException} naming {@code entityName}. */
  default T getOrThrow(Long id, String entityName) {
    return findById(id).orElseThrow(() -> ResourceNotFoundException.of(entityName, id));
  }

  /** One page of entities mapped to DTOs, in the API's standard {@link PageResponse} shape. */
  default <R> PageResponse<R> findPage(Pageable pageable, Function<T, R> mapper) {
    return PageResponse.from(findAll(pageable), mapper);
  }
}
