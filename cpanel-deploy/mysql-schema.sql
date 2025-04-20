-- IPCR Early Warning & Response System - MySQL Database Schema
-- For cPanel deployment
-- --------------------------------------------------------

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 1;
SET FOREIGN_KEY_CHECKS=0;

-- Create database
DROP DATABASE IF EXISTS `ipcr-new`;
CREATE DATABASE `ipcr-new` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ipcr-new`;

-- --------------------------------------------------------

--
-- Database structure
--

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255),
  `fullName` VARCHAR(255),
  `role` VARCHAR(50) DEFAULT 'user',
  `securityClearance` INT DEFAULT 1,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_username` (`username`),
  INDEX `idx_users_role` (`role`)
);

-- Data sources table
CREATE TABLE IF NOT EXISTS `data_sources` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `url` VARCHAR(255),
  `apiKey` VARCHAR(255),
  `active` BOOLEAN DEFAULT true,
  `description` TEXT,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_data_sources_type` (`type`),
  INDEX `idx_data_sources_active` (`active`)
);

-- Incidents table
CREATE TABLE IF NOT EXISTS `incidents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `location` VARCHAR(255),
  `region` VARCHAR(255),
  `state` VARCHAR(255),
  `lga` VARCHAR(255),
  `coordinates` TEXT,
  `latitude` DECIMAL(10, 8),
  `longitude` DECIMAL(11, 8),
  `severity` VARCHAR(50),
  `status` VARCHAR(50),
  `category` VARCHAR(50),
  `reportedBy` INT,
  `reportedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `verificationStatus` VARCHAR(50) DEFAULT 'unverified',
  `impactedPopulation` INT,
  `mediaUrls` JSON,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`reportedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_incidents_region` (`region`),
  INDEX `idx_incidents_state` (`state`),
  INDEX `idx_incidents_category` (`category`),
  INDEX `idx_incidents_status` (`status`),
  INDEX `idx_incidents_severity` (`severity`),
  INDEX `idx_incidents_created` (`createdAt`),
  INDEX `idx_incidents_verification` (`verificationStatus`)
);

-- Incident reactions table
CREATE TABLE IF NOT EXISTS `incident_reactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `incidentId` INT NOT NULL,
  `userId` INT NOT NULL,
  `emoji` VARCHAR(50) NOT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`incidentId`) REFERENCES `incidents`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_reaction` (`incidentId`, `userId`, `emoji`),
  INDEX `idx_reactions_incident` (`incidentId`),
  INDEX `idx_reactions_user` (`userId`)
);

-- Alerts table
CREATE TABLE IF NOT EXISTS `alerts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `level` VARCHAR(50),
  `status` VARCHAR(50),
  `sourceCategory` VARCHAR(50),
  `region` VARCHAR(255),
  `affectedAreas` JSON,
  `issuedBy` INT,
  `expiresAt` DATETIME,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`issuedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_alerts_level` (`level`),
  INDEX `idx_alerts_status` (`status`),
  INDEX `idx_alerts_region` (`region`),
  INDEX `idx_alerts_expires` (`expiresAt`),
  INDEX `idx_alerts_created` (`createdAt`)
);

-- Risk indicators table
CREATE TABLE IF NOT EXISTS `risk_indicators` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(50),
  `value` FLOAT,
  `threshold` FLOAT,
  `region` VARCHAR(255),
  `dataSourceId` INT,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`dataSourceId`) REFERENCES `data_sources`(`id`) ON DELETE SET NULL,
  INDEX `idx_risk_indicators_category` (`category`),
  INDEX `idx_risk_indicators_region` (`region`)
);

-- Risk analyses table
CREATE TABLE IF NOT EXISTS `risk_analyses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `region` VARCHAR(255),
  `riskLevel` VARCHAR(50),
  `factors` JSON,
  `recommendations` TEXT,
  `analyzedBy` INT,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`analyzedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_risk_analyses_level` (`riskLevel`),
  INDEX `idx_risk_analyses_region` (`region`),
  INDEX `idx_risk_analyses_created` (`createdAt`)
);

-- Response plans table
CREATE TABLE IF NOT EXISTS `response_plans` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `region` VARCHAR(255),
  `steps` JSON,
  `resources` JSON,
  `status` VARCHAR(50),
  `createdBy` INT,
  `interAgencyPortal` VARCHAR(255),
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_response_plans_status` (`status`),
  INDEX `idx_response_plans_region` (`region`)
);

-- Response activities table
CREATE TABLE IF NOT EXISTS `response_activities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `location` VARCHAR(255),
  `status` VARCHAR(50),
  `responsePlanId` INT,
  `assignedTeamId` INT,
  `startDate` DATETIME,
  `endDate` DATETIME,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`responsePlanId`) REFERENCES `response_plans`(`id`) ON DELETE SET NULL,
  INDEX `idx_response_activities_status` (`status`),
  INDEX `idx_response_activities_start` (`startDate`),
  INDEX `idx_response_activities_end` (`endDate`)
);

-- Response teams table
CREATE TABLE IF NOT EXISTS `response_teams` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `contactPerson` VARCHAR(255),
  `contactEmail` VARCHAR(255),
  `contactPhone` VARCHAR(50),
  `members` JSON,
  `specialization` VARCHAR(255),
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_response_teams_specialization` (`specialization`)
);

-- API Keys table
CREATE TABLE IF NOT EXISTS `api_keys` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `key` VARCHAR(255) NOT NULL UNIQUE,
  `permissions` JSON,
  `userId` INT,
  `lastUsed` DATETIME,
  `active` BOOLEAN DEFAULT true,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_api_keys_key` (`key`),
  INDEX `idx_api_keys_active` (`active`)
);

-- Webhooks table
CREATE TABLE IF NOT EXISTS `webhooks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  `events` JSON,
  `secret` VARCHAR(255),
  `userId` INT,
  `active` BOOLEAN DEFAULT true,
  `lastTriggered` DATETIME,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_webhooks_active` (`active`)
);

-- Surveys table
CREATE TABLE IF NOT EXISTS `surveys` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `questions` JSON NOT NULL,
  `isTemplate` BOOLEAN DEFAULT false,
  `createdBy` INT,
  `startDate` DATETIME,
  `endDate` DATETIME,
  `status` VARCHAR(50) DEFAULT 'draft',
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_surveys_template` (`isTemplate`),
  INDEX `idx_surveys_status` (`status`),
  INDEX `idx_surveys_dates` (`startDate`, `endDate`)
);

-- Survey responses table
CREATE TABLE IF NOT EXISTS `survey_responses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `surveyId` INT NOT NULL,
  `respondentId` INT,
  `respondentName` VARCHAR(255),
  `respondentContact` VARCHAR(255),
  `answers` JSON NOT NULL,
  `submittedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `location` VARCHAR(255),
  `coordinates` VARCHAR(255),
  FOREIGN KEY (`surveyId`) REFERENCES `surveys`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`respondentId`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_survey_responses_survey` (`surveyId`),
  INDEX `idx_survey_responses_submitted` (`submittedAt`)
);

-- Community informants table
CREATE TABLE IF NOT EXISTS `community_informants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `contact` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255),
  `region` VARCHAR(255),
  `state` VARCHAR(255),
  `lga` VARCHAR(255),
  `specialization` VARCHAR(255),
  `verificationStatus` VARCHAR(50) DEFAULT 'unverified',
  `active` BOOLEAN DEFAULT true,
  `notes` TEXT,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_informants_region` (`region`),
  INDEX `idx_informants_state` (`state`),
  INDEX `idx_informants_lga` (`lga`),
  INDEX `idx_informants_active` (`active`),
  INDEX `idx_informants_verification` (`verificationStatus`)
);

-- --------------------------------------------------------

--
-- Default Admin User
--

INSERT INTO `users` (`username`, `password`, `email`, `fullName`, `role`, `securityClearance`)
VALUES (
  'admin', 
  '9f27ac323fd6613f8ee96f5008a751b6a02e47b83eb8ba4700dd95b4630dbddb.4dbc581e0ad25430a8e20408b150850e', -- Will be changed during initialization to @admin123321nimda$
  'admin@example.com', 
  'System Administrator', 
  'admin', 
  7
) ON DUPLICATE KEY UPDATE id=id;

-- --------------------------------------------------------

--
-- Sample Data Sources 
--

INSERT INTO `data_sources` (`name`, `type`, `url`, `apiKey`, `active`, `description`)
VALUES 
  ('Nigeria News Media', 'RSS', 'https://news.example.com/feed', NULL, TRUE, 'Major news outlets in Nigeria'),
  ('Social Media Feed', 'API', 'https://api.socialmedia.com', 'sample_key_1234', TRUE, 'Social media monitoring for conflict-related terms'),
  ('Government Reports', 'CSV', 'https://data.gov.ng/reports', NULL, TRUE, 'Official government security reports')
ON DUPLICATE KEY UPDATE id=id;

-- Restore foreign key checks
SET FOREIGN_KEY_CHECKS=1;