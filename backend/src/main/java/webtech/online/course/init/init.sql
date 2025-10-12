CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    password_hash TEXT, -- nullable if oauth
    auth_provider VARCHAR(50) NOT NULL DEFAULT 'LOCAL', -- local | google | github | facebook
    provider_user_id VARCHAR(255), -- id from OAuth provider
    status VARCHAR(20) DEFAULT 'ACTIVE', -- active | banned | deleted
    user_role VARCHAR(50) DEFAULT "USER",
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    device_info JSONB, -- {"device":"iPhone 15", "ip":"1.2.3.4", "os":"iOS"}
    refresh_token VARCHAR(255) UNIQUE NOT NULL, -- hashed
    revoked BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP, -- enpired refresh token
    last_active_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) REFERENCES plans(id), -- foreign key ref to plans
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active | expired | cancelled
    max_devices INTEGER DEFAULT 1, -- maximun device can login
    auto_renew BOOLEAN DEFAULT FALSE,
    payment_gateway_subscription_id VARCHAR(255), -- ID from Stripe/PayPal to manage
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE oauth_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- google | github | facebook
    client_id VARCHAR(255) NOT NULL,
    client_secret VARCHAR(255) NOT NULL,
    redirect_uri TEXT NOT NULL,
    auth_url TEXT NOT NULL,
    token_url TEXT NOT NULL,
    userinfo_url TEXT NOT NULL,
    scopes TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE login_audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES user_sessions(id) ON DELETE CASCADE,
    ip_address VARCHAR(50),
    device_info JSONB,
    event VARCHAR(50), -- login_success, login_failed, logout, refresh, revoked
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE token_rotations (
    id SERIAL PRIMARY KEY,
    old_refresh_token VARCHAR(255),
    new_refresh_token VARCHAR(255),
    user_id INTEGER REFERENCES users(id),
    session_id INTEGER REFERENCES user_sessions(id),
    rotated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_users_provider_user_id ON users(provider_user_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- refresh token need to encode opt
-- client secret have to encode raw
ALTER TABLE users ADD CONSTRAINT unique_provider_user UNIQUE (auth_provider, provider_user_id);

CREATE TABLE plans (
    id VARCHAR(50) PRIMARY KEY, -- 'free', 'pro', 'premium'. uss VARCHAR do PK for reading
    name VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    duration_days INTEGER, -- NULL if monthly/yearly package, processed via payment gateway
    max_devices INTEGER DEFAULT 1,
    features JSONB, -- {"feature1": true, "feature2": 100}
    is_active BOOLEAN DEFAULT TRUE -- to hide a package exculde from interfaca
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES subscriptions(id),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(20), -- succeeded | pending | failed
    payment_gateway_charge_id VARCHAR(255) UNIQUE, -- transaction id from  Stripe/PayPal
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_info (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    avatar_url TEXT,
    phone_number VARCHAR(50),
    gender VARCHAR(20),
    birth_date DATE,
    address TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    bio TEXT,

    last_login TIMESTAMP,
    preferences JSONB, -- lưu cấu hình cá nhân như theme, ngôn ngữ...

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
