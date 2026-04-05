-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Apr 05, 2026 at 10:40 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `internship_management_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `course_name` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `course_name`) VALUES
(1, 'Bachelor of Culture and Arts Education'),
(2, 'Bachelor of Elementary Education'),
(3, 'Bachelor of Secondary Education'),
(4, 'Bachelor of Fine Arts'),
(5, 'Bachelor of Library and Information Science'),
(6, 'Bachelor of Multimedia Arts'),
(7, 'Bachelor of Physical Education'),
(8, 'Bachelor of Arts in Communication'),
(9, 'Bachelor of Arts in English Language'),
(10, 'Bachelor of Arts in Political Science'),
(11, 'Bachelor of Arts in Psychology'),
(12, 'Bachelor of Science in Accountancy'),
(13, 'Bachelor of Science in Business Administration'),
(14, 'Bachelor of Science in Management Accounting'),
(15, 'Bachelor of Science in Office Administration'),
(16, 'Bachelor of Science in Public Administration'),
(17, 'Bachelor of Science in Computer Engineering'),
(18, 'Bachelor of Science in Computer Science'),
(19, 'Bachelor of Science in Information Technology'),
(20, 'Bachelor of Science in Entertainment and Multimedia Computing'),
(21, 'Bachelor of Science in Civil Engineering'),
(22, 'Bachelor of Science in Electrical Engineering'),
(23, 'Bachelor of Science in Electronics Engineering'),
(24, 'Bachelor of Science in Industrial Engineering'),
(25, 'Bachelor of Science in Mechanical Engineering'),
(26, 'Bachelor of Science in Geodetic Engineering'),
(27, 'Bachelor of Science in Architecture'),
(28, 'Bachelor of Science in Biology'),
(29, 'Bachelor of Science in Environmental Science'),
(30, 'Bachelor of Science in Medical Technology'),
(31, 'Bachelor of Science in Nursing'),
(32, 'Bachelor of Science in Criminology'),
(33, 'Bachelor of Science in Hospitality Management'),
(34, 'Bachelor of Science in Tourism Management'),
(35, 'Bachelor of Science in Marine Engineering'),
(36, 'Bachelor of Science in Marine Transportation'),
(37, 'Bachelor of Science in Economics');

-- --------------------------------------------------------

--
-- Table structure for table `daily_narratives`
--

CREATE TABLE `daily_narratives` (
  `id` int(11) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `internship_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `day_number` int(11) NOT NULL,
  `title` varchar(50) NOT NULL,
  `narrative` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `daily_narratives`
--

INSERT INTO `daily_narratives` (`id`, `user_id`, `internship_id`, `created_at`, `day_number`, `title`, `narrative`) VALUES
(66, '53faf489-1491-4486-be4a-5706e8e28a14', 14, '2026-04-05 00:03:18', 1, 'CRUD', 'CRUD (Create, Read, Update, Delete) is an acronym for ways one can operate on stored data. It is a mnemonic for the four basic functions of persistent storage. CRUD typically refers to operations performed in a database or datastore, but it can also apply to higher level functions of an application such as soft deletes where data is not actually deleted but marked as deleted via a status.'),
(68, 'cd7b716e-de19-45ed-8515-1b1fd0f65c34', 15, '2026-04-05 03:33:12', 1, 'CRUD', 'CRUD (Create, Read, Update, Delete) is an acronym for ways one can operate on stored data. It is a mnemonic for the four basic functions of persistent storage. CRUD typically refers to operations performed in a database or datastore, but it can also apply to higher level functions of an application such as soft deletes where data is not actually deleted but marked as deleted via a status.');

-- --------------------------------------------------------

--
-- Table structure for table `daily_time_records`
--

CREATE TABLE `daily_time_records` (
  `id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `internship_id` int(11) NOT NULL,
  `total_hours` float DEFAULT 0,
  `clock_in` time DEFAULT NULL,
  `clock_out` time DEFAULT NULL,
  `user_id` char(36) NOT NULL,
  `location_in` varchar(255) DEFAULT NULL,
  `location_out` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `daily_time_records`
--

INSERT INTO `daily_time_records` (`id`, `created_at`, `internship_id`, `total_hours`, `clock_in`, `clock_out`, `user_id`, `location_in`, `location_out`) VALUES
(123, '2026-04-04 02:55:21', 14, 7.86667, '10:55:21', '18:48:17', '53faf489-1491-4486-be4a-5706e8e28a14', 'San Roque, Sogod-Tibgao, Virac, Catanduanes, Bicol Region, 4800, Philippines', 'San Roque, Sogod-Tibgao, Virac, Catanduanes, Bicol Region, 4800, Philippines'),
(124, '2026-04-04 22:27:39', 14, 0, '06:27:39', NULL, '53faf489-1491-4486-be4a-5706e8e28a14', 'San Roque, Sogod-Tibgao, Virac, Catanduanes, Bicol Region, 4800, Philippines', NULL),
(126, '2026-04-05 03:22:26', 15, 0, '11:22:26', NULL, 'cd7b716e-de19-45ed-8515-1b1fd0f65c34', 'San Roque, Sogod-Tibgao, Virac, Catanduanes, Bicol Region, 4800, Philippines', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `internship_documents`
--

CREATE TABLE `internship_documents` (
  `id` int(11) NOT NULL,
  `user_id` char(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `file_name` varchar(50) NOT NULL,
  `company_name` varchar(50) NOT NULL,
  `category` varchar(10) NOT NULL,
  `url` text DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `internship_documents`
--

INSERT INTO `internship_documents` (`id`, `user_id`, `created_at`, `file_name`, `company_name`, `category`, `url`, `file_type`) VALUES
(17, '53faf489-1491-4486-be4a-5706e8e28a14', '2026-04-04 02:55:47', 'MOA', 'Accenture', 'before', 'https://zwtvevpjfsmqbqpzpxvj.supabase.co/storage/v1/object/public/eu-connect_storage/requirements/53faf489-1491-4486-be4a-5706e8e28a14/1775271346588.pdf', 'application/pdf');

-- --------------------------------------------------------

--
-- Table structure for table `internship_records`
--

CREATE TABLE `internship_records` (
  `id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` char(36) DEFAULT NULL,
  `company_name` varchar(250) DEFAULT NULL,
  `company_address` varchar(255) NOT NULL,
  `status` varchar(10) DEFAULT 'ongoing',
  `date_started` date DEFAULT NULL,
  `date_ended` date DEFAULT NULL,
  `total_hours` float DEFAULT 0,
  `accumulated_hours` float NOT NULL DEFAULT 0,
  `lon` text DEFAULT NULL,
  `lat` text DEFAULT NULL,
  `city_or_town` varchar(50) DEFAULT NULL,
  `state_or_province` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `internship_records`
--

INSERT INTO `internship_records` (`id`, `created_at`, `user_id`, `company_name`, `company_address`, `status`, `date_started`, `date_ended`, `total_hours`, `accumulated_hours`, `lon`, `lat`, `city_or_town`, `state_or_province`) VALUES
(14, '2026-04-04 02:55:18', '53faf489-1491-4486-be4a-5706e8e28a14', 'Accenture', 'Accenture, 11th Drive, Fort Bonifacio, Taguig District 2, Taguig, Southern Manila District, Metro Manila, 1635, Philippines', 'ongoing', '2026-04-06', NULL, 100, 7.86667, '121.0544173', '14.5559247', 'Taguig', 'Manila'),
(15, '2026-04-05 03:09:33', 'cd7b716e-de19-45ed-8515-1b1fd0f65c34', 'PLDT', 'PLDT Lucena, Doña Aurora Boulevard, Pag-asa, Lucena, 2nd District, Calabarzon, 4301, Philippines', 'ongoing', '2026-04-06', NULL, 100, 0, '121.61354531', '13.94451645', 'Lucena', 'Quezon');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `role` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `role`) VALUES
(1, 'student'),
(2, 'employer'),
(3, 'department_head'),
(4, 'admin');

-- --------------------------------------------------------

--
-- Table structure for table `student_academic_info`
--

CREATE TABLE `student_academic_info` (
  `id` int(11) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `student_number` varchar(30) DEFAULT NULL,
  `year_level` varchar(15) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_academic_info`
--

INSERT INTO `student_academic_info` (`id`, `user_id`, `course_id`, `student_number`, `year_level`) VALUES
(9, '53faf489-1491-4486-be4a-5706e8e28a14', 18, NULL, NULL),
(10, '0a7562b0-aa2d-47a5-8830-14fce8309f6e', 18, NULL, NULL),
(11, 'cd7b716e-de19-45ed-8515-1b1fd0f65c34', 17, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `student_profiles`
--

CREATE TABLE `student_profiles` (
  `id` int(11) NOT NULL,
  `user_id` char(36) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(30) NOT NULL,
  `middle_name` varchar(30) NOT NULL,
  `student_number` varchar(15) NOT NULL,
  `course` varchar(50) NOT NULL,
  `full_address` varchar(250) NOT NULL,
  `email` varchar(50) DEFAULT NULL,
  `year_level` varchar(50) DEFAULT NULL,
  `contact_number` char(13) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `email` varchar(50) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `role_id` int(11) DEFAULT NULL,
  `account_locked_until` timestamp NULL DEFAULT NULL,
  `failed_login_attempts` int(11) DEFAULT 0,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `created_at`, `email`, `password_hash`, `role_id`, `account_locked_until`, `failed_login_attempts`, `status`, `deleted_at`) VALUES
('0a7562b0-aa2d-47a5-8830-14fce8309f6e', '2026-04-04 03:09:05', 'rayleighs@email.com', '$2b$10$SwiULYPoAAAfqcqktiGbuOzrdjtp3U5CS5QVCa.y0xqRxiZp173la', 3, NULL, 0, 'active', NULL),
('53faf489-1491-4486-be4a-5706e8e28a14', '2026-04-04 01:15:19', 'uzumaki_naruto@email.com', '$2b$10$B9MMZGtxtcYQ/c8O10Ioleww2f4VT./TFMt1NQjBoK8E8T2Rvwnkm', 1, NULL, 0, 'active', NULL),
('cd7b716e-de19-45ed-8515-1b1fd0f65c34', '2026-04-05 03:07:52', 'jdc@email.com', '$2b$10$fAewi4QAh2MyZ7diuv4RtuMhgFYAAsYRS258khu3LejHtkgfAOdom', 1, NULL, 0, 'active', NULL),
('fc5e18a8-2b0a-4b12-a226-851058374c65', '2026-04-04 01:32:25', 'admin1@email.com', '$2b$10$PudjpT3/MNzVLptfZxThPOGmXvSXa/pBzhJjFFTzVSc4NBuyMkmhC', 4, NULL, 0, 'active', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_profiles`
--

CREATE TABLE `user_profiles` (
  `id` int(11) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `contact_number` char(13) DEFAULT NULL,
  `full_address` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_profiles`
--

INSERT INTO `user_profiles` (`id`, `user_id`, `first_name`, `last_name`, `contact_number`, `full_address`) VALUES
(15, '53faf489-1491-4486-be4a-5706e8e28a14', 'Naruto', 'Uzumaki', NULL, NULL),
(16, 'fc5e18a8-2b0a-4b12-a226-851058374c65', 'Aeron', 'Delen', NULL, NULL),
(17, '0a7562b0-aa2d-47a5-8830-14fce8309f6e', 'Rayleigh', 'Silver', NULL, NULL),
(18, 'cd7b716e-de19-45ed-8515-1b1fd0f65c34', 'Juan', 'Dela Cruz', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `course_name` (`course_name`) USING HASH;

--
-- Indexes for table `daily_narratives`
--
ALTER TABLE `daily_narratives`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_internship_id_dn` (`internship_id`),
  ADD KEY `fk_users_id_dn` (`user_id`) USING BTREE;

--
-- Indexes for table `daily_time_records`
--
ALTER TABLE `daily_time_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_internship_id` (`internship_id`),
  ADD KEY `fk_dtr_user_id` (`user_id`);

--
-- Indexes for table `internship_documents`
--
ALTER TABLE `internship_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_id_storage` (`user_id`);

--
-- Indexes for table `internship_records`
--
ALTER TABLE `internship_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_id` (`user_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `student_academic_info`
--
ALTER TABLE `student_academic_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `fk_student_course_id` (`course_id`);

--
-- Indexes for table `student_profiles`
--
ALTER TABLE `student_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_student_profiles_user` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`);

--
-- Indexes for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `daily_narratives`
--
ALTER TABLE `daily_narratives`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `daily_time_records`
--
ALTER TABLE `daily_time_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=127;

--
-- AUTO_INCREMENT for table `internship_documents`
--
ALTER TABLE `internship_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `internship_records`
--
ALTER TABLE `internship_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `student_academic_info`
--
ALTER TABLE `student_academic_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `student_profiles`
--
ALTER TABLE `student_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user_profiles`
--
ALTER TABLE `user_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `daily_narratives`
--
ALTER TABLE `daily_narratives`
  ADD CONSTRAINT `fk_internship_id_dn` FOREIGN KEY (`internship_id`) REFERENCES `internship_records` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_users_dn` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `daily_time_records`
--
ALTER TABLE `daily_time_records`
  ADD CONSTRAINT `fk_dtr_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_internship_id` FOREIGN KEY (`internship_id`) REFERENCES `internship_records` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `internship_documents`
--
ALTER TABLE `internship_documents`
  ADD CONSTRAINT `fk_user_id_storage` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `internship_records`
--
ALTER TABLE `internship_records`
  ADD CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_academic_info`
--
ALTER TABLE `student_academic_info`
  ADD CONSTRAINT `fk_student_course_id` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user_id_acad_info` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_profiles`
--
ALTER TABLE `student_profiles`
  ADD CONSTRAINT `fk_student_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

--
-- Constraints for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD CONSTRAINT `fk_user_profiles` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
