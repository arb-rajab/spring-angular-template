package com.example.projectname.user;

import com.example.projectname.common.BaseRepository;
import java.util.Optional;

public interface UserRepository extends BaseRepository<User> {
  Optional<User> findByEmailIgnoreCase(String email);

  boolean existsByEmailIgnoreCase(String email);
}
