-- Enterprise Step 2: employee accounts on `user`
-- Additive only. Existing partner users stay partner_customer with no password.

ALTER TABLE `user`
  ADD COLUMN `user_type` ENUM('partner_customer','employee') NOT NULL DEFAULT 'partner_customer' AFTER `business_partner_id`,
  ADD COLUMN `company_id` INT NULL AFTER `user_type`,
  ADD COLUMN `password_hash` VARCHAR(255) NULL AFTER `company_id`,
  ADD COLUMN `employee_code` VARCHAR(64) NULL AFTER `password_hash`,
  ADD COLUMN `department` VARCHAR(255) NULL AFTER `employee_code`,
  ADD COLUMN `active` TINYINT(1) NOT NULL DEFAULT 1 AFTER `department`,
  ADD COLUMN `last_login_at` DATETIME NULL AFTER `active`,
  ADD KEY `idx_user_company` (`company_id`),
  ADD UNIQUE KEY `uk_user_email_company` (`email_id`, `company_id`),
  ADD CONSTRAINT `fk_user_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`id`);
