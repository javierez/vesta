ALTER TABLE `contacts` ADD `account_id` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `listings` ADD `account_id` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `properties` ADD `account_id` bigint NOT NULL;