-- liquibase formatted sql

-- changeset antigravity:002-insert-sample-data
INSERT INTO oauth_providers
(name, client_id, client_secret_key, redirect_uri, auth_url, token_url, userinfo_url, scopes)
VALUES
(
    'google',
    '433962493892-639fiuq1pg19t4537l7sh60g8ngbd79d.apps.googleusercontent.com',
    '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',
    'http://localhost:8081/login/oauth2/code/google',
    'https://accounts.google.com/o/oauth2/v2/auth',
    'https://oauth2.googleapis.com/token',
    'https://openidconnect.googleapis.com/v1/userinfo',
    ARRAY['email','profile']
),
(
    'github',
    'Ov23lilJ1GaqLD6lCO5P',
    '9625e2669d1e4d7714a029ac60745c207c34e7d4',
    'http://localhost:8081/login/oauth2/code/github',
    'https://github.com/login/oauth/authorize',
    'https://github.com/login/oauth/access_token',
    'https://api.github.com/user',
    ARRAY['read:user','user:email']
);

INSERT INTO roles(name) VALUES
('ROLE_TEACHER'),
('ROLE_STUDENT');