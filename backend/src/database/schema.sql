CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS subjects (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNSIGNED NOT NULL,

    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_subjects_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_subjects_user_id (user_id),

    UNIQUE KEY uq_subjects_user_id_id (user_id, id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS tasks (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNSIGNED NOT NULL,
    subject_id INT UNSIGNED NULL,

    title VARCHAR(200) NOT NULL,
    description TEXT NULL,

    deadline DATETIME NOT NULL,
    estimated_minutes INT UNSIGNED NOT NULL,

    priority TINYINT UNSIGNED NOT NULL DEFAULT 3,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_tasks_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_tasks_subject
        FOREIGN KEY (user_id, subject_id)
        REFERENCES subjects(user_id, id)
        ON DELETE CASCADE,

    CONSTRAINT chk_tasks_estimated_minutes
        CHECK (estimated_minutes > 0),

    CONSTRAINT chk_tasks_priority
        CHECK (priority BETWEEN 1 AND 5),

    INDEX idx_tasks_user_id (user_id),
    INDEX idx_tasks_subject_id (subject_id),
    INDEX idx_tasks_deadline (deadline),
    INDEX idx_tasks_status (status),

    UNIQUE KEY uq_tasks_user_id_id (user_id, id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS availability (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNSIGNED NOT NULL,

    day_of_week TINYINT UNSIGNED NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_availability_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_availability_day
        CHECK (day_of_week BETWEEN 0 AND 6),

    CONSTRAINT chk_availability_time
        CHECK (end_time > start_time),

    INDEX idx_availability_user_id (user_id),
    INDEX idx_availability_day (day_of_week)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS study_sessions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNSIGNED NOT NULL,
    task_id INT UNSIGNED NOT NULL,

    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'scheduled',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_study_sessions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_study_sessions_task
        FOREIGN KEY (user_id, task_id)
        REFERENCES tasks(user_id, id)
        ON DELETE CASCADE,

    CONSTRAINT chk_study_sessions_time
        CHECK (end_at > start_at),

    INDEX idx_study_sessions_user_id (user_id),
    INDEX idx_study_sessions_task_id (task_id),
    INDEX idx_study_sessions_start_at (start_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;