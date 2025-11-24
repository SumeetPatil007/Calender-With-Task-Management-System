-- init.sql
-- Create database (optional, or create manually and run below)
-- CREATE DATABASE calendar_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE calendar_app;

CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  priority ENUM('low','medium','high') DEFAULT 'low',
  category VARCHAR(100) DEFAULT 'general',
  status ENUM('pending','completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- sample data
INSERT INTO tasks (title, description, due_date, priority, category, status)
VALUES
('Finish report', 'Complete monthly report', '2025-11-25', 'high', 'work', 'pending'),
('Buy groceries', 'Milk, eggs, bread', '2025-11-24', 'low', 'personal', 'completed'),
('Team meeting', 'Discuss sprint', '2025-11-26', 'medium', 'work', 'pending');
