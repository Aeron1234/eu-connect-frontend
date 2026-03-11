-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Mar 10, 2026 at 04:49 PM
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
(1, 'c738553a-91cf-4b53-b911-590b265692b4', 1, '2026-03-04 10:21:52', 1, 'Familiarization', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s.'),
(4, 'c738553a-91cf-4b53-b911-590b265692b4', 1, '2026-03-06 12:49:55', 2, 'CRUD', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s.'),
(6, 'c738553a-91cf-4b53-b911-590b265692b4', 1, '2026-03-07 01:55:14', 3, 'PROGRAMMING', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s.'),
(27, 'c738553a-91cf-4b53-b911-590b265692b4', 1, '2026-03-07 19:44:06', 4, 'Introduction to Node.js', 'Node.js is an open-source and cross-platform JavaScript runtime environment. It is a popular tool for almost any kind of project!\r\n\r\nNode.js runs the V8 JavaScript engine, the core of Google Chrome, outside of the browser. This allows Node.js to be very performant.\r\n\r\nA Node.js app runs in a single process, without creating a new thread for every request. Node.js provides a set of asynchronous I/O primitives in its standard library that prevent JavaScript code from blocking. In addition, libraries in Node.js are generally written using non-blocking paradigms. Accordingly, blocking behavior is the exception rather than the norm in Node.js.\r\n\r\nWhen Node.js performs an I/O operation, like reading from the network, accessing a database or the filesystem, instead of blocking the thread and wasting CPU cycles waiting, Node.js will resume the operations when the response comes back.\r\n\r\nThis allows Node.js to handle thousands of concurrent connections with a single server without introducing the burden of managing thread concurrency, which could be a significant source of bugs.\r\n\r\nNode.js has a unique advantage because millions of frontend developers that write JavaScript for the browser are now able to write the server-side code in addition to the client-side code without the need to learn a completely different language.\r\n\r\nIn Node.js the new ECMAScript standards can be used without problems, as you don\'t have to wait for all your users to update their browsers - you are in charge of deciding which ECMAScript version to use by changing the Node.js version, and you can also enable specific experimental features by running Node.js with flags.'),
(28, 'c738553a-91cf-4b53-b911-590b265692b4', 1, '2026-03-08 05:19:21', 5, 'AWS', 'Amazon Web Services (AWS), a subsidiary of Amazon, is the world\'s most comprehensive and broadly adopted cloud platform, offering over 200 fully featured services from data centers globally. It provides on-demand, pay-as-you-go infrastructure (IaaS), platform (PaaS), and software (SaaS) services, including compute power, database storage, and content delivery, widely used by startups, enterprises, and government agencies.');

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
  `user_id` char(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `daily_time_records`
--

INSERT INTO `daily_time_records` (`id`, `created_at`, `internship_id`, `total_hours`, `clock_in`, `clock_out`, `user_id`) VALUES
(17, '2026-02-28 04:03:52', 1, 9.76667, '12:30:07', '22:16:42', 'c738553a-91cf-4b53-b911-590b265692b4'),
(25, '2026-03-01 02:44:07', 1, 9.3, '10:44:07', '20:02:08', 'c738553a-91cf-4b53-b911-590b265692b4'),
(47, '2026-03-02 01:44:18', 1, 9.38333, '09:44:18', '19:07:58', 'c738553a-91cf-4b53-b911-590b265692b4'),
(48, '2026-03-03 04:29:42', 1, 7.48333, '12:29:42', '19:58:51', 'c738553a-91cf-4b53-b911-590b265692b4'),
(81, '2026-03-04 02:13:23', 1, 7.08333, '10:13:23', '17:19:00', 'c738553a-91cf-4b53-b911-590b265692b4'),
(84, '2026-03-06 12:38:55', 1, 5.38333, '17:53:38', '23:17:30', 'c738553a-91cf-4b53-b911-590b265692b4'),
(85, '2026-03-07 01:45:10', 1, 12.4, '09:45:10', '22:09:27', 'c738553a-91cf-4b53-b911-590b265692b4'),
(90, '2026-03-08 08:34:50', 1, 19.5, '00:56:33', '20:27:23', 'c738553a-91cf-4b53-b911-590b265692b4'),
(91, '2026-03-08 16:24:18', 1, 19.9833, '00:24:18', '20:23:19', 'c738553a-91cf-4b53-b911-590b265692b4');

-- --------------------------------------------------------

--
-- Table structure for table `internship_records`
--

CREATE TABLE `internship_records` (
  `id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` char(36) DEFAULT NULL,
  `company_name` varchar(250) DEFAULT NULL,
  `address_line_1` varchar(250) DEFAULT NULL,
  `address_line_2` varchar(250) DEFAULT NULL,
  `town_or_city` varchar(250) DEFAULT NULL,
  `state_or_province` varchar(250) DEFAULT NULL,
  `status` varchar(10) DEFAULT 'ongoing',
  `date_started` date DEFAULT NULL,
  `date_ended` date DEFAULT NULL,
  `total_hours` float DEFAULT 0,
  `accumulated_hours` float NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `internship_records`
--

INSERT INTO `internship_records` (`id`, `created_at`, `user_id`, `company_name`, `address_line_1`, `address_line_2`, `town_or_city`, `state_or_province`, `status`, `date_started`, `date_ended`, `total_hours`, `accumulated_hours`) VALUES
(1, '2026-02-27 05:07:06', 'c738553a-91cf-4b53-b911-590b265692b4', 'DPWH', '123 Random Street', 'Random Barangay', 'Candelaria', 'Quezon', 'ongoing', '2026-02-28', NULL, 100, 100.287);

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
  `full_address` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_profiles`
--

INSERT INTO `student_profiles` (`id`, `user_id`, `first_name`, `last_name`, `middle_name`, `student_number`, `course`, `full_address`) VALUES
(1, 'c738553a-91cf-4b53-b911-590b265692b4', 'Luffy', 'Monkey', 'D', 'A23-0000', 'Bachelor of Science in Computer Science', 'Malabanban Norte, Candelaria, Quezon');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `email` varchar(50) NOT NULL,
  `password_hash` varchar(50) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `account_locked_until` timestamp NULL DEFAULT NULL,
  `failed_login_attempts` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `created_at`, `email`, `password_hash`, `role_id`, `account_locked_until`, `failed_login_attempts`) VALUES
('8996edd7-e185-4c17-928a-ad45c961bf55', '2026-02-25 05:28:48', 'employer1@email.com', 'qwerty12345', 2, NULL, 0),
('8b7deb81-74b0-4969-9b92-44995d74523d', '2026-02-25 05:28:48', 'department_head1@email.com', 'qwerty12345', 3, NULL, 0),
('c738553a-91cf-4b53-b911-590b265692b4', '2026-02-25 05:28:48', 'student1@email.com', 'qwerty12345', 1, NULL, 0),
('e3393d35-adc5-4203-b569-f37482182b5d', '2026-02-25 05:28:48', 'admin1@email.com', 'qwerty12345', 4, NULL, 0);

--
-- Indexes for dumped tables
--

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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `daily_narratives`
--
ALTER TABLE `daily_narratives`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `daily_time_records`
--
ALTER TABLE `daily_time_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT for table `internship_records`
--
ALTER TABLE `internship_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `student_profiles`
--
ALTER TABLE `student_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
-- Constraints for table `internship_records`
--
ALTER TABLE `internship_records`
  ADD CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
