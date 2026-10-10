# Local Keycloak realm (dev and CI only)

`project-name-realm.json` is imported by the `keycloak` service in
`docker-compose.yml`, and by the `testcontainers-keycloak` module in the
backend's OIDC integration tests from a copy at
`backend/src/test/resources/keycloak/project-name-realm.json`. Keep the two
files identical. The realm defines:

- One confidential client, `project-name-backend`, with a fixed dev-only
  secret (`project-name-dev-secret`, matching the default in
  `application.yml`). It has `directAccessGrantsEnabled: true` (the OAuth2
  Resource Owner Password Credentials grant) purely so integration tests can
  obtain a real, Keycloak-signed token without scripting a browser through the
  login form. A real user's browser only ever goes through the standard
  authorization-code redirect.
- Two test users, both with the throwaway password `Password123!`:
  - `sso.newhire@example.test` has no matching local account, so logging in
    with it demonstrates provisioning a new user through SSO.
  - `existing.user@example.test` shares its email with an account registered
    through the password API in the integration test, so logging in with it
    demonstrates linking an OIDC identity onto an existing account.

None of this is real. `sslRequired: none` and the fixed client secret are only
safe because this Keycloak instance is never meant to be reachable from
anywhere but `localhost` and the compose network. For a real deployment, point
`OIDC_*` at your identity provider, use a client secret from a secret manager,
turn `directAccessGrantsEnabled` off, and require TLS.
