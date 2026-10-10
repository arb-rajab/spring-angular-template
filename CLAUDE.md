# CLAUDE.md

Notes for Claude Code sessions working in this Spring Boot and Angular repo.

## Backend

- Pipe Maven output through a filter: every `mvn` call in a sandbox with a proxy
  prints a long `Picked up JAVA_TOOL_OPTIONS` banner first.
  `mvn -B test 2>&1 | grep -v '^Picked up JAVA_TOOL_OPTIONS' | tail -40`
- Formatting is enforced by Spotless (google-java-format) in `mvn verify`. After
  editing any `.java` file run `mvn spotless:apply` once, instead of formatting
  by hand and re-running a failing check.
- `mvn test` runs only unit tests (`*Test.java`) and needs no Docker. `*IT.java`
  integration tests start PostgreSQL and Keycloak through Testcontainers and run
  in `mvn verify`; they cannot run where there is no Docker daemon or the
  registries are blocked (`docker pull` fails with 403 or 429). Do not loop on
  that locally: push and read the CI result.
- `@H2SpringBootTest` (in `src/test/.../support`) boots the full context on
  in-memory H2 without Docker. Use it for wiring and repository tests that do not
  need the real Flyway schema. Tests sharing identical configuration share one
  cached context, so adding more of them is cheap.
- `src/test/resources/application.yml` shadows `src/main/resources/application.yml`
  entirely on the test classpath. Anything the context needs at startup that the
  test base classes do not supply (for example the OIDC client registration) must
  be repeated there.
- Flyway migrations are append-only once shipped: add `Vn__description.sql`, never
  edit an applied one. Hibernate runs with `ddl-auto: validate`, so an entity change
  without a migration fails at startup.
- New feature package layout: one package per concept with `Entity`, `EntityRepository`
  (extend `BaseRepository`), `EntityService`, `EntityController` and a `dto/`
  subfolder of records. `user/` is the reference.
- Paginated endpoints: build the `Pageable` with `PageParams.of(...)` (clamps size,
  allow-lists sort properties) and return `PageResponse<T>` via
  `repository.findPage(pageable, mapper)`.
- Security chains: `oidcFilterChain` (`@Order(1)`, sessions) matches only
  `/oauth2/**` and `/login/**`; `apiFilterChain` (`@Order(2)`) is stateless JWT.
  Keep `PasswordEncoder` in `PasswordEncoderConfig`: moving it into `SecurityConfig`
  creates a circular dependency (`SecurityConfig` injects the OIDC success handler,
  which needs `UserService`, which needs the encoder).
- OIDC failures and deactivated accounts must behave like password login: the
  success handler runs `AccountStatusUserDetailsChecker` and refresh-token rotation
  re-checks `user.isActive()`. Keep both when changing those classes.
- Dependency overrides in `pom.xml` properties (`tomcat.version`, `jackson-*`,
  `postgresql.version`, ...) exist to pick up patched releases. Drop each once Spring
  Boot's managed version catches up.

## Frontend

- Tests need a Chrome binary and, running as root, `--no-sandbox`:
  ```bash
  cd frontend
  CHROME_BIN=/opt/pw-browsers/chromium npx ng test --no-watch --no-progress \
    --browsers=ChromeHeadlessCI --karma-config=karma.conf.js
  ```
  `ChromeHeadlessCI` is defined in `karma.conf.js`; do not pass bare `ChromeHeadless`.
- Run `npm ci` before `npx ng ...`. Without `node_modules`, `npx` silently fetches an
  unpinned CLI version and fails confusingly.
- `npx ng lint` includes template accessibility rules. A clickable non-interactive
  element needs a role (the modal backdrop uses `role="presentation"`) or must be a
  real button.
- Shared components live in `src/app/shared/ui`, one folder each with a spec. Prefer
  extending them over new global CSS classes. Forms: `app-form-field` shows client
  validator messages (once touched or dirty) and server messages passed in
  `[errors]`; feed it `parseApiError(error).fieldErrors['field']`.
- The access token is stored in `localStorage` under the `project-name.*` keys. That
  is readable by any script on the page, so keep third-party scripts out and keep the
  access-token lifetime short.
- Angular packages must be upgraded together with `ng update`; Dependabot ignores
  major bumps of `@angular/*`, `zone.js`, `typescript`, `eslint` and `jasmine-core`
  for that reason.

## Repository

- Docker Compose pins the frontend (nginx) container to `172.28.0.10` and tells the
  backend to trust forwarded-for headers only from that address
  (`RATE_LIMIT_TRUSTED_PROXIES`). Change both together.
- Secrets never go in the repo: `.env` is ignored, `.env.example` lists variable names
  only, CI runs gitleaks. The Keycloak realm file contains a dev-only client secret
  and test passwords; it must never be pointed at a reachable host.
- Vulnerability exceptions go in `osv-scanner.toml` with an expiry date and a reason.
- Record decisions in `docs/project-memory/07-decisions.md`.
