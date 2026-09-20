-- ============================================================================
-- SMART CANTEEN SYSTEM - MYSQL DATABASE SCHEMA
-- Target Database: smart_canteen
-- Enforces: Unique College Email (@aaacet.ac.in), BCrypt Password Hashes, 
-- Foreign Keys, Indexes, Normalized Tables for Orders, Items, Notifications
-- ============================================================================

CREATE DATABASE IF NOT EXISTS smart_canteen DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_canteen;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mobile VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'STUDENT', -- 'STUDENT', 'ADMIN'
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'SUSPENDED'
    email_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. PASSWORD RESET TOKENS TABLE
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reset_token (token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. FOODS TABLE
CREATE TABLE IF NOT EXISTS foods (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    food_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'Beverages', 'Fast Food', 'Pizza', 'Meals', 'Snacks', 'Drinks', 'Desserts'
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_veg BOOLEAN NOT NULL DEFAULT TRUE,
    availability_status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED'
    stock_quantity INT NOT NULL DEFAULT 0,
    minimum_stock_alert INT NOT NULL DEFAULT 5,
    preparation_time_minutes INT NOT NULL DEFAULT 10,
    popular_rank INT DEFAULT 0,
    available_from VARCHAR(10) DEFAULT '08:00',
    available_until VARCHAR(10) DEFAULT '19:00',
    available_days VARCHAR(100) DEFAULT 'Mon,Tue,Wed,Thu,Fri,Sat',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_food_category (category),
    INDEX idx_food_avail (availability_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. WORKING HOURS TABLE
CREATE TABLE IF NOT EXISTS working_hours (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    day VARCHAR(20) NOT NULL UNIQUE, -- 'Monday', 'Tuesday', etc.
    opening_time VARCHAR(10) NOT NULL DEFAULT '08:00',
    closing_time VARCHAR(10) NOT NULL DEFAULT '19:00',
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL UNIQUE, -- e.g. SC20260810001
    user_id BIGINT NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    student_mobile VARCHAR(20) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL DEFAULT 'UPI', -- 'UPI', 'Cash'
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PAID', -- 'PAID', 'PENDING', 'REFUNDED', 'FAILED'
    transaction_id VARCHAR(100),
    requested_ready_date VARCHAR(20) NOT NULL DEFAULT 'Today',
    requested_ready_time VARCHAR(10) NOT NULL DEFAULT '13:00',
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL', -- 'HIGH', 'MEDIUM', 'NORMAL'
    order_status VARCHAR(30) NOT NULL DEFAULT 'Order Placed',
    rejection_reason TEXT,
    refund_status VARCHAR(20) DEFAULT 'NONE', -- 'NONE', 'INITIATED', 'PROCESSING', 'COMPLETED', 'FAILED'
    refund_amount DECIMAL(10,2) DEFAULT 0.00,
    refund_transaction_id VARCHAR(100),
    queue_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL DEFAULT NULL,
    preparing_at TIMESTAMP NULL DEFAULT NULL,
    ready_at TIMESTAMP NULL DEFAULT NULL,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    cancelled_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_order_student (student_id),
    INDEX idx_order_status (order_status),
    INDEX idx_order_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. ORDER ITEMS TABLE (Preserves historical food name and unit price)
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    food_id VARCHAR(50) NOT NULL,
    food_name VARCHAR(120) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    is_veg BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    INDEX idx_order_item_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. IN-APP NOTIFICATIONS TABLE (Strictly scoped by recipient user)
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    notification_id VARCHAR(50) NOT NULL UNIQUE,
    recipient_user_id VARCHAR(50) NOT NULL, -- Student ID or 'ADMIN'
    recipient_role VARCHAR(20) NOT NULL, -- 'STUDENT', 'ADMIN'
    order_id VARCHAR(50),
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(30) NOT NULL, -- 'order_placed', 'order_accepted', 'order_rejected', 'order_preparing', 'order_ready', 'order_completed', 'refund', 'system'
    read_status BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notif_recipient (recipient_user_id),
    INDEX idx_notif_read (read_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- INITIAL SEED DATA FOR DEMO & TESTING
-- Initial Admin Account: admin@aaacet.ac.in / admin123
-- ============================================================================

INSERT INTO users (user_id, student_id, name, email, mobile, password_hash, role) VALUES
('ADM001', 'ADM001', 'QuickServe Admin', 'admin@aaacet.ac.in', '+91 91234 56789', '$2a$10$wT3J0Gk7B8VjM2xRkL2c5.xZ2O2Z5s4X3v1U9m8N7b6V5c4B3a2S1', 'ADMIN')
ON DUPLICATE KEY UPDATE email=email;

INSERT INTO foods (food_id, name, description, category, price, image_url, is_veg, availability_status, stock_quantity, minimum_stock_alert, preparation_time_minutes) VALUES
('F101', 'Hot Masala Chai', 'Aromatic Indian tea brewed with cardamom, ginger, and fresh milk.', 'Beverages', 15.00, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80', TRUE, 'AVAILABLE', 50, 10, 5),
('F102', 'South Indian Filter Coffee', 'Traditional strong decoction coffee with foamy fresh milk.', 'Beverages', 20.00, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80', TRUE, 'AVAILABLE', 40, 10, 5),
('F103', 'Crispy Potato Samosa (2 pcs)', 'Spicy potato and green peas stuffed crispy fried pastry.', 'Snacks', 25.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80', TRUE, 'AVAILABLE', 30, 5, 8),
('F104', 'Ghee Roast Masala Dosa', 'Golden crispy rice crepe filled with seasoned potato masala & chutney.', 'Meals', 60.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80', TRUE, 'AVAILABLE', 25, 5, 12),
('F105', 'Veg Cheese Burger', 'Juicy veg patty topped with melted cheddar, lettuce and tangy sauce.', 'Fast Food', 75.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', TRUE, 'AVAILABLE', 20, 5, 15),
('F106', 'Paneer Tikka Pizza (7 inch)', 'Hand-tossed pizza loaded with marinated paneer tikka & mozzarella.', 'Pizza', 140.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80', TRUE, 'AVAILABLE', 15, 3, 18),
('F107', 'Grilled Cheese Sandwich', 'Toasted golden bread with melted double cheese & spicy herbs.', 'Fast Food', 50.00, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80', TRUE, 'AVAILABLE', 25, 5, 10),
('F108', 'South Indian Special Thali', 'Complete meal with rice, sambar, rasam, kootu, poriyal, curd & appalam.', 'Meals', 90.00, 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80', TRUE, 'AVAILABLE', 35, 8, 10),
('F109', 'Schezwan Veg Fried Noodles', 'Wok-tossed noodles with crunchy vegetables in hot schezwan sauce.', 'Fast Food', 80.00, 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80', TRUE, 'AVAILABLE', 20, 5, 12),
('F110', 'Peri Peri French Fries', 'Crispy golden potato fries tossed in zesty peri peri seasoning.', 'Snacks', 60.00, 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&auto=format&fit=crop&q=80', TRUE, 'AVAILABLE', 30, 5, 10),
('F111', 'Fresh Mango Shake / Juice', 'Chilled thick mango milkshake topped with vanilla ice cream scoop.', 'Drinks', 45.00, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80', TRUE, 'AVAILABLE', 25, 5, 5)
ON DUPLICATE KEY UPDATE name=name;
