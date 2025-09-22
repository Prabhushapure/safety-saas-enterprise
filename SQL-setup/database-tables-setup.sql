-- Schema: Industrial safety training / games
-- Engine & charset defaults
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

-- Create database if needed (optional)
-- CREATE DATABASE IF NOT EXISTS safety_games CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE safety_games;

-- ---------- Tables ----------

CREATE TABLE IF NOT EXISTS `company` (
  `id`              INT          NOT NULL AUTO_INCREMENT,
  `company_code`    VARCHAR(32)  NOT NULL,
  `company_name`    VARCHAR(255) NOT NULL,
  `address`         TEXT,
  `city`            VARCHAR(255) NOT NULL,
  `country`         VARCHAR(255) NOT NULL,
  `logo_url`        TEXT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_company_company_code` (`company_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `business_partner` (
  `id`                    INT           NOT NULL AUTO_INCREMENT,
  `company_code`          VARCHAR(32)   NOT NULL,  -- FK to company.company_code
  `first_name`            VARCHAR(255)  NOT NULL,
  `last_name`             VARCHAR(255),
  `login_id`              VARCHAR(255),            -- suggest: email as user id
  `password`              VARCHAR(255),            -- hashed
  PRIMARY KEY (`id`),
  KEY `idx_bp_company_code` (`company_code`),
  CONSTRAINT `fk_bp_company_code__company_company_code`
    FOREIGN KEY (`company_code`) REFERENCES `company`(`company_code`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- NOTE: `user` is a reserved word; we quote it with backticks.
CREATE TABLE IF NOT EXISTS `user` (
  `id`               INT           NOT NULL AUTO_INCREMENT,
  `email_id`         VARCHAR(255)  NOT NULL,
  `name`             VARCHAR(255),
  `organization`     VARCHAR(255),
  `created_at`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `business_partner_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_email` (`email_id`),
  KEY `fk_user_bp_partner_id__bp_id` (`business_partner_id`),
  CONSTRAINT `fk_user_bp_partner_id__bp_id` FOREIGN KEY (`business_partner_id`) REFERENCES `business_partner` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `game` (
  `id`            INT           NOT NULL AUTO_INCREMENT,
  `game_title`    TEXT,
  `game_code`     VARCHAR(64)   NOT NULL,      -- e.g., ELECTRICAL_SAFETY
  `game_version`  INT           NOT NULL,      -- numeric
  `short_desc`    TEXT,
  `long_desc`     TEXT,
  `image_url`     TEXT,
  `file_location` TEXT,                        -- s3 path
  `cdn_url`       TEXT,
  `is_active`     TINYINT(1)    NOT NULL DEFAULT 1,
  `created_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_game_code_version` (`game_code`, `game_version`),
  KEY `idx_game_code` (`game_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- license_tier enum: OneTime | OneMonth | SixMonth | OneYear
CREATE TABLE IF NOT EXISTS `license` (
  `id`                  INT           NOT NULL AUTO_INCREMENT,
  `business_partner_id` INT           NOT NULL,  -- FK to business_partner.id
  `game_id`             INT           NOT NULL,  -- FK to game.id
  `tier`                ENUM('OneTime','OneMonth','SixMonth','OneYear') NOT NULL DEFAULT 'OneTime',
  `token_code`          VARCHAR(64)   NOT NULL,
  `status`              ENUM('unassigned','assigned','used') NOT NULL DEFAULT 'unassigned',
  `user_id`             INT,
  `registered_at`       DATETIME,
  `created_at`          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_license_token_code` (`token_code`),
  KEY `idx_license_game_id` (`game_id`),
  KEY `idx_license_bp_partner_id` (`business_partner_id`),
  KEY `idx_license_user_id` (`user_id`),
  CONSTRAINT `fk_license_game__game_id`
    FOREIGN KEY (`game_id`) REFERENCES `game`(`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_license_bp_partner_id__bp_id`
    FOREIGN KEY (`business_partner_id`) REFERENCES `business_partner`(`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_license_user__user_id`
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- assigned_status enum: Assigned | Activated | Expired | Revoked
CREATE TABLE IF NOT EXISTS `assigned_game` (
  `id`            BIGINT        NOT NULL AUTO_INCREMENT,
  `bp_id`         INT           NOT NULL,              -- FK to business_partner.id
  `user_id`       INT,                                 -- may be null
  `email_id`      VARCHAR(255),                        -- for invite-before-user-exists
  `game_id`       INT           NOT NULL,              -- FK to game.id
  `game_version`  INT,                                 -- redundant if pointing to versioned row
  `date_time`     DATETIME,
  `status`        ENUM('Assigned','Activated','Expired','Revoked') NOT NULL DEFAULT 'Assigned',
  `license_id`    INT,                                 -- FK to license.id
  `pin`           VARCHAR(16),
  `activated_on`  DATETIME,
  `expires_on`    DATETIME,
  PRIMARY KEY (`id`),
  KEY `idx_assigned_bp_id` (`bp_id`),
  KEY `idx_assigned_user_id` (`user_id`),
  KEY `idx_assigned_email_id` (`email_id`),
  KEY `idx_assigned_game_id` (`game_id`),
  KEY `idx_assigned_status` (`status`),
  KEY `idx_assigned_expires_on` (`expires_on`),
  CONSTRAINT `fk_assigned_bp__bp_id`
    FOREIGN KEY (`bp_id`) REFERENCES `business_partner`(`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_assigned_user__user_id`
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `fk_assigned_email__user_email`
    FOREIGN KEY (`email_id`) REFERENCES `user`(`email_id`)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `fk_assigned_game__game_id`
    FOREIGN KEY (`game_id`) REFERENCES `game`(`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_assigned_license__license_id`
    FOREIGN KEY (`license_id`) REFERENCES `license`(`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- play_status enum: NotStarted | Play | Replay
-- output_status enum: Pass | Fail
CREATE TABLE IF NOT EXISTS `play_tracker` (
  `id`            BIGINT        NOT NULL AUTO_INCREMENT,
  `user_id`       INT           NOT NULL,          -- FK to user.id
  `game_id`       INT           NOT NULL,          -- FK to game.id
  `license_id`    INT,                             -- FK to license.id
  `status`        ENUM('NotStarted','Play','Replay') NOT NULL,
  `output_status` ENUM('Pass','Fail'),
  `paused_at`     VARCHAR(255),
  `score`         INT,
  `created_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_play_license_id` (`license_id`),
  KEY `idx_play_user_game_created` (`user_id`,`game_id`,`created_at`),
  CONSTRAINT `fk_play_user__user_id`
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_play_game__game_id`
    FOREIGN KEY (`game_id`) REFERENCES `game`(`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_play_license__license_id`
    FOREIGN KEY (`license_id`) REFERENCES `license`(`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `login_tracker` (
  `id`         BIGINT        NOT NULL AUTO_INCREMENT,
  `email_id`   VARCHAR(255)  NOT NULL,
  `login_time` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_addr`    VARCHAR(64),
  `device`     VARCHAR(255),
  PRIMARY KEY (`id`),
  KEY `idx_login_email_time` (`email_id`, `login_time`),
  CONSTRAINT `fk_login_email__user_email`
    FOREIGN KEY (`email_id`) REFERENCES `user`(`email_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS=1;
