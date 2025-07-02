USE auth_credentials_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, password_hash, user_id) VALUES (
    "testuser",
    "$2a$10$abcdefghijklmnopqrstuvwxy.abcdefghijklmnopqrstuvwxy",
    "some-unique-user-id-123"
);