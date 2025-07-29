-- BetterAuth tables based on auth-schema.ts
-- These tables are separate from your main application tables

CREATE TABLE IF NOT EXISTS `user` (
  `id` varchar(36) PRIMARY KEY,
  `name` text NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `email_verified` boolean NOT NULL DEFAULT false,
  `image` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `account_id` int NOT NULL,
  `last_name` text NOT NULL
);

CREATE TABLE IF NOT EXISTS `session` (
  `id` varchar(36) PRIMARY KEY,
  `expires_at` timestamp NOT NULL,
  `token` varchar(255) NOT NULL UNIQUE,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  `ip_address` text,
  `user_agent` text,
  `user_id` varchar(36) NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `account` (
  `id` varchar(36) PRIMARY KEY,
  `account_id` text NOT NULL,
  `provider_id` text NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `access_token` text,
  `refresh_token` text,
  `id_token` text,
  `access_token_expires_at` timestamp,
  `refresh_token_expires_at` timestamp,
  `scope` text,
  `password` text,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `verification` (
  `id` varchar(36) PRIMARY KEY,
  `identifier` text NOT NULL,
  `value` text NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);