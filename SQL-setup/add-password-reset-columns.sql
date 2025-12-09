-- Add password reset columns to business_partner table
-- Run this migration to enable password reset functionality

ALTER TABLE `business_partner` 
ADD COLUMN `reset_token` VARCHAR(64) NULL AFTER `password`,
ADD COLUMN `reset_password_hash` VARCHAR(255) NULL AFTER `reset_token`,
ADD COLUMN `reset_token_expires` DATETIME NULL AFTER `reset_password_hash`;

-- Add index for faster token lookups
CREATE INDEX `idx_reset_token` ON `business_partner` (`reset_token`);

