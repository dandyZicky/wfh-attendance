USE attendance_db;

CREATE TABLE IF NOT EXISTS attendance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_key CHAR(36) NOT NULL,
    date DATE NOT NULL,
    check_in_time TIMESTAMP NULL,
    check_out_time TIMESTAMP NULL,
    work_location ENUM('office', 'home', 'client_site') NOT NULL DEFAULT 'home',
    status ENUM('present', 'absent', 'late', 'half_day') NOT NULL DEFAULT 'present',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user_date (user_key, date),
    INDEX idx_user_key (user_key),
    INDEX idx_date (date),
    INDEX idx_status (status),
    INDEX idx_work_location (work_location)
);

CREATE TABLE IF NOT EXISTS attendance_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_name VARCHAR(255) NOT NULL,
    report_type ENUM('daily', 'weekly', 'monthly', 'custom') NOT NULL,
    generated_by_user_key CHAR(36) NOT NULL,
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    department_id INT NULL,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    file_path VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_generated_by (generated_by_user_key),
    INDEX idx_date_range (date_from, date_to),
    INDEX idx_department (department_id),
    INDEX idx_status (status)
); 