-- Update users table to match Better-Auth requirements
-- BACKUP YOUR DATA FIRST!

-- Step 1: Create a temporary table with the new structure
CREATE TABLE `users_new` (
  -- BetterAuth required fields (with exact names it expects)
  `id` varchar(36) PRIMARY KEY,
  `name` varchar(200) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified` boolean DEFAULT false,
  `email_verified_at` timestamp NULL,
  `image` varchar(255),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `password` varchar(255),
  
  -- Your additional fields
  `account_id` bigint NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20),
  `timezone` varchar(50) DEFAULT 'UTC',
  `language` varchar(10) DEFAULT 'en',
  `preferences` json DEFAULT '{}',
  `last_login` timestamp NULL,
  `is_verified` boolean DEFAULT false,
  `is_active` boolean DEFAULT true
);

-- Step 2: If you have existing data, you can migrate it like this:
-- INSERT INTO `users_new` (
--   `id`, `name`, `email`, `email_verified`, `email_verified_at`, `image`, 
--   `created_at`, `updated_at`, `password`, `account_id`, `first_name`, 
--   `last_name`, `phone`, `timezone`, `language`, `preferences`, 
--   `last_login`, `is_verified`, `is_active`
-- )
-- SELECT 
--   CONCAT('user_', user_id) as id,  -- Convert bigint to string with prefix
--   first_name as name,              -- Map first_name to name
--   email, email_verified, email_verified_at, profile_image_url as image,
--   created_at, updated_at, password, account_id, first_name,
--   last_name, phone, timezone, language, preferences,
--   last_login, is_verified, is_active
-- FROM `users`;

-- Step 3: Drop the old table and rename the new one
-- DROP TABLE `users`;
-- ALTER TABLE `users_new` RENAME TO `users`;

-- Step 4: Update related tables to use varchar IDs
-- Update sessions table
ALTER TABLE `sessions` MODIFY COLUMN `user_id` varchar(36) NOT NULL;

-- Update auth_accounts table  
ALTER TABLE `auth_accounts` MODIFY COLUMN `user_id` varchar(36) NOT NULL;

-- Note: You'll need to update the foreign key data in sessions and auth_accounts tables
-- to match the new string IDs if you have existing data