-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS parking_management;
USE parking_management;

-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fullName VARCHAR(100) NOT NULL,
    role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create ParkingSlot table
CREATE TABLE IF NOT EXISTS ParkingSlot (
    id INT PRIMARY KEY AUTO_INCREMENT,
    SlotNumber VARCHAR(10) UNIQUE NOT NULL,
    Status ENUM('Available', 'Occupied') NOT NULL DEFAULT 'Available',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Car table
CREATE TABLE IF NOT EXISTS Car (
    id INT PRIMARY KEY AUTO_INCREMENT,
    PlateNumber VARCHAR(20) NOT NULL,
    DriverName VARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(20),
    EntryTime DATETIME NOT NULL,
    ExitTime DATETIME,
    Duration INT,
    Amount DECIMAL(10,2),
    SlotNumber VARCHAR(10),
    PaymentStatus ENUM('Pending', 'Paid') DEFAULT 'Pending',
    FOREIGN KEY (SlotNumber) REFERENCES ParkingSlot(SlotNumber)
);

-- Create PaymentRecord table
CREATE TABLE IF NOT EXISTS PaymentRecord (
    id INT PRIMARY KEY AUTO_INCREMENT,
    PlateNumber VARCHAR(20) NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    PaymentDate DATETIME NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial parking slots (10 slots)
INSERT IGNORE INTO ParkingSlot (SlotNumber, Status)
VALUES 
    ('A1', 'Available'),
    ('A2', 'Available'),
    ('A3', 'Available'),
    ('A4', 'Available'),
    ('A5', 'Available'),
    ('B1', 'Available'),
    ('B2', 'Available'),
    ('B3', 'Available'),
    ('B4', 'Available'),
    ('B5', 'Available');

-- Insert default admin user
-- Password will be hashed by the application (admin123)
INSERT INTO Users (username, password, fullName, role) 
VALUES ('admin', 'placeholder_password', 'System Administrator', 'admin')
ON DUPLICATE KEY UPDATE id=id; 