-- CREATE DATABASE slotdb;
-- \c slotdb;


CREATE TABLE jsusers (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    win_rate DECIMAL(5, 2) DEFAULT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE jsadmins (
    admin_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE jsspins (
    spin_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES jsusers(id),
    bet_amount DECIMAL(10, 2) NOT NULL,
    win_amount DECIMAL(10, 2) DEFAULT 0.00,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE jsgame_settings (
    setting_id SERIAL PRIMARY KEY,
    reels INT NOT NULL,
    rows INT NOT NULL,
    rtp DECIMAL(5, 2) NOT NULL,
    win_rate DECIMAL(5, 2) DEFAULT 30.00 
);


CREATE TABLE jstransactions (
    transaction_id SERIAL PRIMARY KEY,
    admin_id INT REFERENCES jsadmins(admin_id),
    user_id INT REFERENCES jsusers(id),
    amount DECIMAL(10, 2) DEFAULT 0.00,
    action_type VARCHAR(50) NOT NULL, 
    new_win_rate DECIMAL(5, 2) DEFAULT NULL,
    previous_win_rate DECIMAL(5, 2) DEFAULT NULL, 
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE jsplayer_statistics (
    user_id INT PRIMARY KEY REFERENCES jsusers(id),
    total_spins INT DEFAULT 0,            
    total_wins INT DEFAULT 0,            
    total_win_amount DECIMAL(10, 2) DEFAULT 0.00, 
    last_win_date TIMESTAMP               
);


INSERT INTO jsusers (username, password, balance, win_rate) VALUES ('user', '$2a$10$2Yi/CA7tyMJ0tP2n1pmm5OMSIYtQe.e/1gmbWL2utewcJbnu.8Og6','5000','30');

INSERT INTO jsadmins (username, password) VALUES ('admin', '$2a$10$2Yi/CA7tyMJ0tP2n1pmm5OMSIYtQe.e/1gmbWL2utewcJbnu.8Og6');
