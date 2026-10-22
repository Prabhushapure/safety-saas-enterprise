-- Enterprise Step 1: identity columns
-- Additive only. Existing rows stay partner / partner role.
-- Run against the local copy of the live database (safety_saas).

ALTER TABLE `company`
  ADD COLUMN `account_type` ENUM('partner','enterprise') NOT NULL DEFAULT 'partner' AFTER `bolactive`,
  ADD COLUMN `company_slug` VARCHAR(64) NULL AFTER `account_type`,
  ADD UNIQUE KEY `uk_company_slug` (`company_slug`);

ALTER TABLE `business_partner`
  ADD COLUMN `role` ENUM('partner','super_admin','unit_admin') NOT NULL DEFAULT 'partner' AFTER `active`;
