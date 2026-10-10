package com.example.projectname.support;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

/**
 * Boots the whole real Spring context against a throwaway in-memory H2 database in PostgreSQL mode,
 * with Flyway off and the schema generated from the entities. Needs no Docker, so tests using it
 * run in {@code mvn test}.
 *
 * <p>Every test class annotated with this shares one cached application context (identical
 * configuration), so adding more of them costs almost nothing. Use {@link AbstractIntegrationTest}
 * instead when a test must run against the real Flyway-migrated PostgreSQL schema.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@SpringBootTest
@TestPropertySource(
    properties = {
      "spring.datasource.url=jdbc:h2:mem:h2test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
      "spring.datasource.driver-class-name=org.h2.Driver",
      "spring.datasource.username=sa",
      "spring.datasource.password=",
      "spring.jpa.hibernate.ddl-auto=create-drop",
      "spring.flyway.enabled=false"
    })
public @interface H2SpringBootTest {}
