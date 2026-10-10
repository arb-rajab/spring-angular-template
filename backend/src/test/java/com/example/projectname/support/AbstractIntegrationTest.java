package com.example.projectname.support;

import org.junit.jupiter.api.Tag;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * Base class for integration tests that need a real, migrated PostgreSQL database.
 *
 * <p>These tests require a Docker daemon (Testcontainers starts a disposable Postgres container).
 * They run under Failsafe on {@code mvn verify}. For tests that do not need the real schema, use
 * {@link H2SpringBootTest}, which needs no Docker.
 *
 * <p>The container is started manually (the "singleton container" pattern) rather than via
 * {@code @Testcontainers}/{@code @Container}, which would stop and restart it - on a new port -
 * between each IT subclass. Spring's test-context cache then keeps reusing the first subclass's
 * DataSource pointing at the now-dead old port, so every IT class after the first one fails with
 * connection-refused/timeout errors. Starting it once, here, and letting the JVM (and
 * Testcontainers' Ryuk reaper) tear it down at shutdown keeps one Postgres instance - and one port
 * - alive for every IT class in the run.
 */
@Tag("integration")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
public abstract class AbstractIntegrationTest {

  static final PostgreSQLContainer POSTGRES =
      new PostgreSQLContainer(DockerImageName.parse("postgres:16-alpine"))
          .withDatabaseName("project_name_test")
          .withUsername("project_name_test")
          .withPassword("project_name_test");

  static {
    POSTGRES.start();
  }

  @DynamicPropertySource
  static void datasourceProperties(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
    registry.add("spring.datasource.username", POSTGRES::getUsername);
    registry.add("spring.datasource.password", POSTGRES::getPassword);
  }
}
