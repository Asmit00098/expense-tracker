-- schema.sql: MySQL schema for Personal Expense Tracker
--
-- Table: users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

-- Table: categories
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: payment_methods
CREATE TABLE payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    method ENUM('Cash','Card','UPI','Other') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: expenses
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    payment_method_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE CASCADE
);

-- Table: budgets
CREATE TABLE budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    amount_limit DECIMAL(10,2) NOT NULL,
    month CHAR(7) NOT NULL, -- Format: YYYY-MM
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Sample Data
-- Insert one user (password is 'password123')
INSERT INTO users (name, email, password_hash) VALUES ('Alice Example', 'alice@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

-- Insert two categories for Alice (user_id = 1)
INSERT INTO categories (user_id, name) VALUES (1, 'Food'), (1, 'Transport');

-- Insert two payment methods for Alice
INSERT INTO payment_methods (user_id, method) VALUES (1, 'Card'), (1, 'Cash');

-- Insert one budget for Food in June 2024
INSERT INTO budgets (user_id, category_id, amount_limit, month) VALUES (1, 1, 200.00, '2024-06');

-- Insert three expenses for Alice
INSERT INTO expenses (user_id, category_id, amount, date, description, payment_method_id) VALUES
  (1, 1, 25.50, '2024-06-02', 'Lunch at cafe', 1),
  (1, 2, 15.00, '2024-06-03', 'Bus ticket', 2),
  (1, 1, 30.00, '2024-06-05', 'Groceries', 1); 