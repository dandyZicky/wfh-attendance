USE user_management_db;

CREATE TABLE IF NOT EXISTS roles (
    role_id INT NOT NULL PRIMARY KEY,
    role VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255),
    email VARCHAR(255),
    role_id INT,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

INSERT INTO roles (role_id, role) VALUES (0, "HR");
INSERT INTO roles (role_id, role) VALUES (1, "Staff");