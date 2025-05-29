-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: May 24, 2025 at 11:36 PM
-- Server version: 10.1.13-MariaDB
-- PHP Version: 5.6.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `parking_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `car`
--

CREATE TABLE `car` (
  `id` int(11) NOT NULL,
  `PlateNumber` varchar(20) NOT NULL,
  `DriverName` varchar(100) NOT NULL,
  `PhoneNumber` varchar(20) DEFAULT NULL,
  `EntryTime` datetime NOT NULL,
  `ExitTime` datetime DEFAULT NULL,
  `Duration` int(11) DEFAULT NULL,
  `Amount` decimal(10,2) DEFAULT NULL,
  `SlotNumber` varchar(10) DEFAULT NULL,
  `PaymentStatus` enum('Pending','Paid') DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `car`
--

INSERT INTO `car` (`id`, `PlateNumber`, `DriverName`, `PhoneNumber`, `EntryTime`, `ExitTime`, `Duration`, `Amount`, `SlotNumber`, `PaymentStatus`) VALUES
(5, 'RAF 111B', 'Tjeic', '078876543', '2025-05-23 10:08:08', '2025-05-23 10:08:36', 120, '1000.00', 'A5', 'Paid'),
(6, 'RAG 455C', 'Ganza', '078876544', '2025-05-23 11:37:45', '2025-05-23 11:39:01', 121, '1500.00', 'A4', 'Paid'),
(7, 'RAD 123B', 'kayigi', '0787654345', '2025-05-23 11:40:56', '2025-05-23 12:08:37', 148, '1500.00', 'B1', 'Paid'),
(9, 'RAA 114E', 'Thomas', '0788640719', '2025-05-23 12:08:15', '2025-05-23 13:47:35', 219, '2000.00', 'A2', 'Paid'),
(10, 'RAC 111B', 'Parfait', '078765434', '2025-05-23 13:47:06', NULL, NULL, NULL, 'A5', 'Pending');

-- --------------------------------------------------------

--
-- Table structure for table `parkingslot`
--

CREATE TABLE `parkingslot` (
  `id` int(11) NOT NULL,
  `SlotNumber` varchar(10) NOT NULL,
  `Status` enum('Available','Occupied') NOT NULL DEFAULT 'Available',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `parkingslot`
--

INSERT INTO `parkingslot` (`id`, `SlotNumber`, `Status`, `createdAt`) VALUES
(1, 'A1', 'Available', '2025-05-23 09:06:33'),
(2, 'A2', 'Available', '2025-05-23 09:06:33'),
(3, 'A3', 'Available', '2025-05-23 09:06:33'),
(4, 'A4', 'Available', '2025-05-23 09:06:33'),
(5, 'A5', 'Occupied', '2025-05-23 09:06:33'),
(6, 'B1', 'Available', '2025-05-23 09:06:33'),
(7, 'B2', 'Available', '2025-05-23 09:06:33'),
(8, 'B3', 'Available', '2025-05-23 09:06:33'),
(10, 'B5', 'Available', '2025-05-23 09:06:33'),
(61, 'B4', 'Available', '2025-05-23 11:29:07');

-- --------------------------------------------------------

--
-- Table structure for table `paymentrecord`
--

CREATE TABLE `paymentrecord` (
  `id` int(11) NOT NULL,
  `PlateNumber` varchar(20) NOT NULL,
  `Amount` decimal(10,2) NOT NULL,
  `PaymentDate` datetime NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `paymentrecord`
--

INSERT INTO `paymentrecord` (`id`, `PlateNumber`, `Amount`, `PaymentDate`, `createdAt`) VALUES
(6, 'RAF 111B', '1000.00', '2025-05-23 10:08:44', '2025-05-23 10:08:44'),
(7, 'RAG 455C', '1500.00', '2025-05-23 11:39:15', '2025-05-23 11:39:15'),
(9, 'RAD 123B', '1500.00', '2025-05-23 12:09:12', '2025-05-23 12:09:12'),
(10, 'RAA 114E', '2000.00', '2025-05-23 13:47:49', '2025-05-23 13:47:49');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fullName` varchar(100) NOT NULL,
  `role` enum('admin','staff') NOT NULL DEFAULT 'staff',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `fullName`, `role`, `createdAt`, `updatedAt`) VALUES
(1, 'admin', '$2b$10$w7qRyXPlAXFvJtsHgldnLOQd7bYdCf3ahPjhzcsfh6zI5u7EWIouS', 'System Administrator', 'admin', '2025-05-23 09:06:33', '2025-05-23 13:44:23');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `car`
--
ALTER TABLE `car`
  ADD PRIMARY KEY (`id`),
  ADD KEY `SlotNumber` (`SlotNumber`);

--
-- Indexes for table `parkingslot`
--
ALTER TABLE `parkingslot`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `SlotNumber` (`SlotNumber`);

--
-- Indexes for table `paymentrecord`
--
ALTER TABLE `paymentrecord`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `car`
--
ALTER TABLE `car`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
--
-- AUTO_INCREMENT for table `parkingslot`
--
ALTER TABLE `parkingslot`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;
--
-- AUTO_INCREMENT for table `paymentrecord`
--
ALTER TABLE `paymentrecord`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `car`
--
ALTER TABLE `car`
  ADD CONSTRAINT `car_ibfk_1` FOREIGN KEY (`SlotNumber`) REFERENCES `parkingslot` (`SlotNumber`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
