-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 16, 2025 at 03:47 AM
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
-- Database: `kids_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `age_groups`
--

CREATE TABLE `age_groups` (
  `id` int(11) NOT NULL,
  `age_value` varchar(50) NOT NULL COMMENT 'ค่าที่ใช้ลิงก์กับตารางอื่น เช่น 2-3',
  `label` varchar(100) NOT NULL COMMENT 'ชื่อที่แสดง เช่น 2-3 ปี',
  `description` varchar(255) DEFAULT NULL COMMENT 'คำอธิบาย เช่น วัยเตาะแตะ',
  `color` varchar(50) DEFAULT 'blue' COMMENT 'ธีมสี',
  `icon_name` varchar(50) DEFAULT 'Baby' COMMENT 'ชื่อไอคอน',
  `logo_url` varchar(255) DEFAULT NULL COMMENT 'โลโก้/รูปไอคอนของช่วงอายุ',
  `cate_cover_url` varchar(255) DEFAULT NULL,
  `icon_url` varchar(255) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0 COMMENT 'ลำดับการแสดงผล'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `age_groups`
--

INSERT INTO `age_groups` (`id`, `age_value`, `label`, `description`, `color`, `icon_name`, `logo_url`, `cate_cover_url`, `icon_url`, `sort_order`) VALUES
(1, '2-3', 'รวมใบงานช่วงอายุ 2-3 ปี', 'เตรียมอนุบาล', 'green', 'Baby', '/uploads/age-logos/age_1_1765789915674.png', '/uploads/age-cate-covers/cate_1_1765789915664.png', NULL, 1),
(2, '3-4', 'รวมใบงานช่วงอายุ 3-4 ปี', 'อนุบาล 1', 'orange', 'Shapes', '/uploads/age-logos/age_2_1765784954289.png', '/uploads/age-cate-covers/cate_2_1765851973467.png', NULL, 2),
(3, '4-5', 'รวมใบงานช่วงอายุ 4-5 ปี', 'อนุบาล 2', 'blue', 'Rocket', '/uploads/age-logos/age_3_1765785286872.png', '/uploads/age-cate-covers/cate_3_1765851974352.png', NULL, 3),
(4, '5-6', 'รวมใบงานช่วงอายุ 5-6 ปี', 'อนุบาล 3', 'pink', 'Star', '/uploads/age-logos/age_4_1765785517151.png', '/uploads/age-cate-covers/cate_4_1765851978335.png', NULL, 4),
(5, 'เตรียมป1', 'เตรียมขึ้น ป.1', 'สอบเข้า', 'red', 'Backpack', '/uploads/age-logos/age_5_1765790176320.png', '/uploads/age-cate-covers/cate_5_1765790181104.png', NULL, 5),
(6, 'เสริมเชาว์', 'เสริมเชาว์ปัญญา', 'ฝึกสมอง', 'purple', 'Brain', '/uploads/age-logos/age_6_1765790858922.png', '/uploads/age-cate-covers/cate_6_1765790186416.png', NULL, 6),
(7, 'บัตรคำ', 'รวมบัตรคำ', 'บัตรคำ', 'yellow', 'Layers', '/uploads/age-logos/age_7_1765790931920.jpg', '/uploads/age-cate-covers/cate_7_1765790197522.png', NULL, 7),
(8, 'ตามหน่วย', 'ใบงาน', 'การเรียนรู้', 'teal', 'FolderOpen', '/uploads/age-logos/age_8_1765791093018.jpg', '/uploads/age-cate-covers/cate_8_1765791063650.png', NULL, 8),
(49, 'MTR_TEST', '1-20', 'TEST MTR', 'pink', 'Baby', '/uploads/age-logos/age_49_1765784435212.png', '/uploads/age-cate-covers/cate_49_1765851984836.png', NULL, 9);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `age_group` varchar(50) NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `icon_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `age_group`, `sort_order`, `icon_url`) VALUES
(16, '1.ใบงานหน่วยยินดีที่รู้จัก', 'ตามหน่วย', 1, NULL),
(17, '2.ใบงานหน่วย หนูจำได้(สัญลักษณ์ของหนู)', 'ตามหน่วย', 2, NULL),
(18, 'แบบฝึกเข้า ป.1', 'เตรียมป1', 3, NULL),
(39, 'เตรียมอนุบาล', '2-3', 4, '/uploads/category-icons/cat_39_1765788929362.png'),
(40, '4 สาระ', '2-3', 5, NULL),
(41, '4 สาระ', '4-5', 6, NULL),
(44, '4 สาระ', '5-6', 7, NULL),
(45, '4 สาระ', '3-4', 8, NULL),
(46, '4 วิชาหลัก', '2-3', 9, NULL),
(47, 'อาเซียน', '2-3', 10, NULL),
(48, 'อาเซียน', '3-4', 11, NULL),
(49, 'อาเซียน', '4-5', 12, NULL),
(50, 'อาเซียน', '5-6', 13, NULL),
(51, 'ภาษาอังกฤษ', '2-3', 14, NULL),
(52, 'ภาษาอังกฤษ', '3-4', 15, NULL),
(53, 'ภาษาอังกฤษ', '4-5', 16, NULL),
(54, 'ภาษาอังกฤษ', '5-6', 17, NULL),
(55, 'คณิตศาสตร์', '2-3', 18, NULL),
(56, 'คณิตศาสตร์', '3-4', 19, NULL),
(57, 'คณิตศาสตร์', '4-5', 20, NULL),
(58, 'คณิตศาสตร์', '5-6', 21, NULL),
(59, 'ภาษาไทย', '2-3', 22, NULL),
(60, 'ภาษาไทย', '3-4', 23, NULL),
(61, 'ภาษาไทย', '4-5', 24, NULL),
(62, 'ภาษาไทย', '5-6', 25, NULL),
(63, 'บัตรคำ A-Z', 'บัตรคำ', 26, NULL),
(67, 'TEST1', '2-3', 27, NULL),
(68, 'TEST2', '2-3', 28, NULL),
(69, 'TEST3', '2-3', 29, NULL),
(71, '1', 'ตามหน่วย', 31, NULL),
(73, 'ใบงานหน่วยพยัญชนะ', 'เสริมเชาว์', 0, NULL),
(74, 'ใบงานหน่วยคณิตศาสตร์', 'เสริมเชาว์', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` varchar(20) DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `name`, `role`, `created_at`) VALUES
(1, 'admin', '2003', 'Admin', 'admin', '2025-12-09 06:35:06'),
(2, 'beem', '123', 'beem', 'user', '2025-12-09 06:40:31'),
(4, 'Maiprae', '05032547', 'Maiprae', 'user', '2025-12-09 07:37:39'),
(5, 'beemza', '123', 'ด.ช บีม', 'user', '2025-12-10 06:45:12'),
(7, '123', '123', '123', 'user', '2025-12-10 06:52:08'),
(8, 'V', 'v', 'V', 'user', '2025-12-10 06:56:26'),
(9, 'warit', '1234', 'warit', 'user', '2025-12-10 07:08:21');

-- --------------------------------------------------------

--
-- Table structure for table `worksheets`
--

CREATE TABLE `worksheets` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `age_range` varchar(50) NOT NULL,
  `category` varchar(255) NOT NULL,
  `image_url` text DEFAULT NULL,
  `pdf_url` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `worksheets`
--

INSERT INTO `worksheets` (`id`, `title`, `age_range`, `category`, `image_url`, `pdf_url`, `created_at`) VALUES
(30, 'แบบฝึกหัดเข้า ป.1', 'เตรียมป1', 'แบบฝึกเข้า ป.1', '/uploads/1765333568499.png', '/uploads/1765333568577.pdf', '2025-12-10 02:26:25'),
(31, 'เตรียมอนุบาล', '2-3', 'เตรียมอนุบาล', '/uploads/1765333949317.png', '/uploads/1765333949465.pdf', '2025-12-10 02:32:53'),
(33, 'ใบความรูปเด็กอายุ 2-3 ปี (4 สาระ)', '2-3', '4 สาระ', '/uploads/1765335163183.png', '/uploads/1765335163255.pdf', '2025-12-10 02:53:13'),
(34, 'ใบความรู้เด็กอายุ 4-5 (4 สาระ)', '4-5', '4 สาระ', '/uploads/1765335609647.png', '/uploads/1765335609791.pdf', '2025-12-10 03:01:49'),
(36, 'ใบความรู้เด็กอายุ 5-6 (4 สาระ)', '5-6', '4 สาระ', '/uploads/1765336367357.png', '/uploads/1765336367452.pdf', '2025-12-10 03:13:18'),
(42, 'ใบความรู้เด็กอายุ 3-4 (4 สาระ)', '3-4', '4 สาระ', '/uploads/1765338208061.png', '/uploads/1765338208176.pdf', '2025-12-10 03:44:00'),
(44, 'อาเซียน', '2-3,3-4,4-5,5-6', 'อาเซียน', '/uploads/1765339986630.png', '/uploads/1765339895525.pdf', '2025-12-10 04:06:26'),
(45, 'ภาษาอังกฤษ', '2-3,3-4,4-5,5-6', 'ภาษาอังกฤษ', '/uploads/1765340234714.png', '/uploads/1765340234817.pdf', '2025-12-10 04:18:46'),
(46, 'ภาษาไทย', '2-3,3-4,4-5,5-6', 'ภาษาไทย', '/uploads/1765340493858.png', '/uploads/1765340493978.pdf', '2025-12-10 04:22:59'),
(47, 'คณิตศาสตร์', '2-3,3-4,4-5,5-6', 'คณิตศาสตร์', '/uploads/1765340699898.png', '/uploads/1765340700080.pdf', '2025-12-10 04:26:35'),
(61, 'บัตรคำ A-Z', 'บัตรคำ', 'บัตรคำ A-Z', '/uploads/1765525691535.jpg', '/uploads/1765525691899.pdf', '2025-12-10 06:26:07'),
(62, 'ยินดีที่รู้จัก', 'ตามหน่วย', '1.ใบงานหน่วยยินดีที่รู้จัก', '/uploads/1765348190291.jpg', '/uploads/1765348190316.pdf', '2025-12-10 06:29:50'),
(63, 'หนูจำได้(สัญลักษณ์ของหนู)', 'ตามหน่วย', '2.ใบงานหน่วย หนูจำได้(สัญลักษณ์ของหนู)', '/uploads/1765348267845.jpg', '/uploads/1765348267873.pdf', '2025-12-10 06:31:08'),
(64, 'ใบงานหน่วยหนูจำได้', 'ตามหน่วย', '2.ใบงานหน่วย หนูจำได้(สัญลักษณ์ของหนู)', '/uploads/1765348326158.jpg', '/uploads/1765348326172.pdf', '2025-12-10 06:32:06'),
(90, 'ใบงานหน่วยพยัญชนะไทย', 'เสริมเชาว์', 'ใบงานหน่วยพยัญชนะ', '/uploads/1765769078701.jpg', '/uploads/1765769078942.pdf', '2025-12-15 03:24:39'),
(91, 'ใบงานหน่วยคณิตศาสตร์', 'เสริมเชาว์', 'ใบงานหน่วยคณิตศาสตร์', '/uploads/1765769297168.jpg', '/uploads/1765769297271.pdf', '2025-12-15 03:28:18');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `age_groups`
--
ALTER TABLE `age_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `age_value` (`age_value`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `worksheets`
--
ALTER TABLE `worksheets`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `age_groups`
--
ALTER TABLE `age_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `worksheets`
--
ALTER TABLE `worksheets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=92;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
