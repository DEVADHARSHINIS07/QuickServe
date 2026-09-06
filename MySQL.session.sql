CREATE DATABASE IF NOT EXISTS smart_canteen
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE smart_canteen;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mobile VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    email_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_reset_token (token_hash)
);


CREATE TABLE IF NOT EXISTS foods (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    food_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_veg BOOLEAN NOT NULL DEFAULT TRUE,
    availability_status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    stock_quantity INT NOT NULL DEFAULT 0,
    minimum_stock_alert INT NOT NULL DEFAULT 5,
    preparation_time_minutes INT NOT NULL DEFAULT 10,
    popular_rank INT DEFAULT 0,
    available_from VARCHAR(10) DEFAULT '08:00',
    available_until VARCHAR(10) DEFAULT '19:00',
    available_days VARCHAR(100)
        DEFAULT 'Mon,Tue,Wed,Thu,Fri,Sat',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_food_category (category),
    INDEX idx_food_avail (availability_status)
);


CREATE TABLE IF NOT EXISTS working_hours (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    day VARCHAR(20) NOT NULL UNIQUE,
    opening_time VARCHAR(10) NOT NULL DEFAULT '08:00',
    closing_time VARCHAR(10) NOT NULL DEFAULT '19:00',
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    student_mobile VARCHAR(20) NOT NULL,

    subtotal DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,

    payment_method VARCHAR(20) NOT NULL DEFAULT 'UPI',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    transaction_id VARCHAR(100),

    requested_ready_date VARCHAR(20) NOT NULL,
    requested_ready_time VARCHAR(10) NOT NULL,

    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    order_status VARCHAR(30) NOT NULL DEFAULT 'Order Placed',

    rejection_reason TEXT,

    refund_status VARCHAR(20) DEFAULT 'NONE',
    refund_amount DECIMAL(10,2) DEFAULT 0.00,
    refund_transaction_id VARCHAR(100),

    queue_number VARCHAR(20) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL,
    preparing_at TIMESTAMP NULL,
    ready_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_order_student (student_id),
    INDEX idx_order_status (order_status),
    INDEX idx_order_created (created_at)
);


CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(S50) NOT NULL,
    food_id VARCHAR(50) NOT NULL,
    food_name VARCHAR(120) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    is_veg BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE,

    INDEX idx_order_item_order (order_id)
);


CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    notification_id VARCHAR(50) NOT NULL UNIQUE,
    recipient_user_id VARCHAR(50) NOT NULL,
    recipient_role VARCHAR(20) NOT NULL,
    order_id VARCHAR(50),

    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(30) NOT NULL,

    read_status BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_notif_recipient (recipient_user_id),
    INDEX idx_notif_read (read_status)
);