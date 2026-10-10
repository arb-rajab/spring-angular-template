-- Links a user record to an external OIDC identity (for example Keycloak) by email.
--
-- `password_hash` stays NOT NULL: a user provisioned purely via OIDC still gets a random,
-- unguessable BCrypt hash at creation time (see UserService.findOrProvisionForOidc), so the
-- password login path needs no null-password special case.

ALTER TABLE users ADD COLUMN oidc_provider VARCHAR(60);
ALTER TABLE users ADD COLUMN oidc_subject VARCHAR(255);

-- One external identity maps to at most one local user, per provider. Partial index because most
-- rows (password-only users) have no OIDC identity at all.
CREATE UNIQUE INDEX uq_users_oidc_identity ON users (oidc_provider, oidc_subject)
    WHERE oidc_subject IS NOT NULL;
