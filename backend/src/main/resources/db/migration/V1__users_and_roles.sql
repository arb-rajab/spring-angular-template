CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    email         VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name    VARCHAR(80)  NOT NULL,
    last_name     VARCHAR(80)  NOT NULL,
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE user_roles (
    user_id BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    role    VARCHAR(40) NOT NULL,
    PRIMARY KEY (user_id, role)
);
