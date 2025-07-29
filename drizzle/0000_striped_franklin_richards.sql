-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `account` (
	`id` varchar(36) NOT NULL,
	`provider_id` text NOT NULL,
	`account_id` text NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp,
	`refresh_token_expires_at` timestamp,
	`scope` text,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`password` text,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `accounts` (
	`account_id` bigint AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`logo` varchar(2048),
	`address` varchar(500),
	`phone` varchar(20),
	`email` varchar(255),
	`website` varchar(255),
	`portal_settings` JSON DEFAULT '{}',
	`payment_settings` JSON DEFAULT '{}',
	`preferences` JSON DEFAULT '{}',
	`plan` varchar(50) DEFAULT 'basic',
	`subscription_status` varchar(20) DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`is_active` tinyint DEFAULT 1,
	CONSTRAINT `accounts_account_id` PRIMARY KEY(`account_id`)
);
--> statement-breakpoint
CREATE TABLE `appointments` (
	`appointment_id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`contact_id` bigint NOT NULL,
	`listing_id` bigint,
	`lead_id` bigint,
	`deal_id` bigint,
	`prospect_id` bigint,
	`datetime_start` timestamp NOT NULL,
	`datetime_end` timestamp NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'Scheduled',
	`notes` text,
	`is_active` tinyint DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_appointment_id` PRIMARY KEY(`appointment_id`)
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`contact_id` bigint AUTO_INCREMENT NOT NULL,
	`account_id` bigint NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`email` varchar(255),
	`phone` varchar(20),
	`additional_info` JSON DEFAULT '{}',
	`org_id` bigint,
	`is_active` tinyint DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contacts_contact_id` PRIMARY KEY(`contact_id`)
);
--> statement-breakpoint
CREATE TABLE `deal_participants` (
	`deal_id` bigint NOT NULL,
	`contact_id` bigint NOT NULL,
	`role` varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `deals` (
	`deal_id` bigint AUTO_INCREMENT NOT NULL,
	`listing_id` bigint NOT NULL,
	`stage` varchar(20) NOT NULL,
	`close_date` timestamp,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deals_deal_id` PRIMARY KEY(`deal_id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`doc_id` bigint AUTO_INCREMENT NOT NULL,
	`filename` varchar(255) NOT NULL,
	`file_type` varchar(50) NOT NULL,
	`file_url` varchar(2048) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`property_id` bigint,
	`contact_id` bigint,
	`listing_id` bigint,
	`lead_id` bigint,
	`deal_id` bigint,
	`appointment_id` bigint,
	`prospect_id` bigint,
	`document_key` varchar(2048) NOT NULL,
	`s3key` varchar(2048) NOT NULL,
	`document_tag` varchar(255),
	`document_order` int NOT NULL DEFAULT 0,
	`uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`is_active` tinyint DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_doc_id` PRIMARY KEY(`doc_id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`lead_id` bigint AUTO_INCREMENT NOT NULL,
	`contact_id` bigint NOT NULL,
	`listing_id` bigint,
	`source` varchar(50) NOT NULL,
	`status` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_lead_id` PRIMARY KEY(`lead_id`)
);
--> statement-breakpoint
CREATE TABLE `listing_contacts` (
	`listing_contact_id` bigint AUTO_INCREMENT NOT NULL,
	`listing_id` bigint NOT NULL,
	`contact_id` bigint NOT NULL,
	`contact_type` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`is_active` tinyint DEFAULT 1,
	CONSTRAINT `listing_contacts_listing_contact_id` PRIMARY KEY(`listing_contact_id`)
);
--> statement-breakpoint
CREATE TABLE `listings` (
	`listing_id` bigint AUTO_INCREMENT NOT NULL,
	`account_id` bigint NOT NULL,
	`property_id` bigint NOT NULL,
	`agent_id` bigint NOT NULL,
	`listing_type` varchar(20) NOT NULL,
	`price` decimal(12,2) NOT NULL,
	`status` varchar(20) NOT NULL,
	`is_furnished` tinyint,
	`furniture_quality` varchar(50),
	`optional_garage` tinyint,
	`optional_garage_price` decimal(12,2),
	`optional_storage_room` tinyint NOT NULL DEFAULT 0,
	`optional_storage_room_price` decimal(12,2),
	`has_keys` tinyint NOT NULL DEFAULT 0,
	`student_friendly` tinyint,
	`pets_allowed` tinyint,
	`appliances_included` tinyint,
	`internet` tinyint DEFAULT 0,
	`oven` tinyint DEFAULT 0,
	`microwave` tinyint DEFAULT 0,
	`washing_machine` tinyint DEFAULT 0,
	`fridge` tinyint DEFAULT 0,
	`tv` tinyint DEFAULT 0,
	`stoneware` tinyint DEFAULT 0,
	`is_featured` tinyint DEFAULT 0,
	`is_bank_owned` tinyint DEFAULT 0,
	`is_active` tinyint DEFAULT 1,
	`visibility_mode` smallint DEFAULT 1,
	`view_count` int DEFAULT 0,
	`inquiry_count` int DEFAULT 0,
	`fotocasa` tinyint DEFAULT 0,
	`idealista` tinyint DEFAULT 0,
	`habitaclia` tinyint DEFAULT 0,
	`pisoscom` tinyint DEFAULT 0,
	`yaencontre` tinyint DEFAULT 0,
	`milanuncios` tinyint DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `listings_listing_id` PRIMARY KEY(`listing_id`)
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`neighborhood_id` bigint AUTO_INCREMENT NOT NULL,
	`city` varchar(100) NOT NULL,
	`province` varchar(100) NOT NULL,
	`municipality` varchar(100) NOT NULL,
	`neighborhood` varchar(100) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`is_active` tinyint DEFAULT 1,
	CONSTRAINT `locations_neighborhood_id` PRIMARY KEY(`neighborhood_id`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`org_id` bigint AUTO_INCREMENT NOT NULL,
	`org_name` varchar(255) NOT NULL,
	`address` varchar(255),
	`city` varchar(100),
	`state` varchar(100),
	`postal_code` varchar(20),
	`country` varchar(100),
	CONSTRAINT `organizations_org_id` PRIMARY KEY(`org_id`)
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`property_id` bigint AUTO_INCREMENT NOT NULL,
	`account_id` bigint NOT NULL,
	`reference_number` varchar(32),
	`title` varchar(255),
	`description` text,
	`property_type` varchar(20) DEFAULT 'piso',
	`property_subtype` varchar(50),
	`form_position` int NOT NULL DEFAULT 1,
	`bedrooms` smallint,
	`bathrooms` decimal(3,1),
	`square_meter` int,
	`year_built` smallint,
	`cadastral_reference` varchar(255),
	`built_surface_area` decimal(10,2),
	`conservation_status` smallint DEFAULT 1,
	`street` varchar(255),
	`address_details` varchar(255),
	`postal_code` varchar(20),
	`neighborhood_id` bigint,
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`energy_certification` text,
	`energy_certificate_status` varchar(20),
	`energy_consumption_scale` varchar(2),
	`energy_consumption_value` decimal(6,2),
	`emissions_scale` varchar(2),
	`emissions_value` decimal(6,2),
	`has_heating` tinyint DEFAULT 0,
	`heating_type` varchar(50),
	`has_elevator` tinyint DEFAULT 0,
	`has_garage` tinyint DEFAULT 0,
	`has_storage_room` tinyint DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`is_active` tinyint DEFAULT 1,
	`garage_type` varchar(50),
	`garage_spaces` smallint,
	`garage_in_building` tinyint,
	`elevator_to_garage` tinyint,
	`garage_number` varchar(20),
	`gym` tinyint DEFAULT 0,
	`sports_area` tinyint DEFAULT 0,
	`children_area` tinyint DEFAULT 0,
	`suite_bathroom` tinyint DEFAULT 0,
	`nearby_public_transport` tinyint DEFAULT 0,
	`community_pool` tinyint DEFAULT 0,
	`private_pool` tinyint DEFAULT 0,
	`tennis_court` tinyint DEFAULT 0,
	`disabled_accessible` tinyint,
	`vpo` tinyint,
	`video_intercom` tinyint,
	`concierge_service` tinyint,
	`security_guard` tinyint,
	`satellite_dish` tinyint,
	`double_glazing` tinyint,
	`alarm` tinyint,
	`security_door` tinyint,
	`brand_new` tinyint,
	`new_construction` tinyint,
	`under_construction` tinyint,
	`needs_renovation` tinyint,
	`last_renovation_year` smallint,
	`kitchen_type` varchar(50),
	`hot_water_type` varchar(50),
	`open_kitchen` tinyint,
	`french_kitchen` tinyint,
	`furnished_kitchen` tinyint,
	`pantry` tinyint,
	`storage_room_size` int,
	`storage_room_number` varchar(20),
	`terrace` tinyint,
	`terrace_size` int,
	`wine_cellar` tinyint,
	`wine_cellar_size` int,
	`living_room_size` int,
	`balcony_count` smallint,
	`gallery_count` smallint,
	`building_floors` smallint,
	`built_in_wardrobes` varchar(50),
	`main_floor_type` varchar(50),
	`shutter_type` varchar(50),
	`carpentry_type` varchar(50),
	`orientation` varchar(50),
	`air_conditioning_type` varchar(50),
	`window_type` varchar(50),
	`exterior` tinyint,
	`bright` tinyint,
	`views` tinyint,
	`mountain_views` tinyint,
	`sea_views` tinyint,
	`beachfront` tinyint,
	`jacuzzi` tinyint,
	`hydromassage` tinyint,
	`garden` tinyint,
	`pool` tinyint,
	`home_automation` tinyint,
	`music_system` tinyint,
	`laundry_room` tinyint,
	`covered_clothesline` tinyint,
	`fireplace` tinyint,
	CONSTRAINT `properties_property_id` PRIMARY KEY(`property_id`)
);
--> statement-breakpoint
CREATE TABLE `property_images` (
	`property_image_id` bigint AUTO_INCREMENT NOT NULL,
	`property_id` bigint NOT NULL,
	`reference_number` varchar(32) NOT NULL,
	`image_url` varchar(255) NOT NULL,
	`is_active` tinyint DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`image_key` varchar(2048) NOT NULL,
	`image_tag` varchar(255),
	`s3key` varchar(2048) NOT NULL,
	`image_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `property_images_property_image_id` PRIMARY KEY(`property_image_id`)
);
--> statement-breakpoint
CREATE TABLE `prospect_history` (
	`history_id` bigint AUTO_INCREMENT NOT NULL,
	`prospect_id` bigint NOT NULL,
	`previous_status` varchar(50),
	`new_status` varchar(50) NOT NULL,
	`changed_by` varchar(36) NOT NULL,
	`change_reason` text,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `prospect_history_history_id` PRIMARY KEY(`history_id`)
);
--> statement-breakpoint
CREATE TABLE `prospects` (
	`prospect_id` bigint AUTO_INCREMENT NOT NULL,
	`contact_id` bigint NOT NULL,
	`status` varchar(50) NOT NULL,
	`listing_type` varchar(20),
	`property_type` varchar(20),
	`min_price` decimal(12,2),
	`max_price` decimal(12,2),
	`preferred_areas` JSON,
	`min_bedrooms` smallint,
	`min_bathrooms` smallint,
	`min_square_meters` int,
	`max_square_meters` int,
	`move_in_by` timestamp,
	`extras` JSON,
	`urgency_level` smallint,
	`funding_ready` tinyint,
	`notes_internal` text,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `prospects_prospect_id` PRIMARY KEY(`prospect_id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`role_id` bigint AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`description` varchar(255),
	`permissions` JSON DEFAULT '{}',
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`is_active` tinyint DEFAULT 1,
	CONSTRAINT `roles_role_id` PRIMARY KEY(`role_id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(36) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`ip_address` text,
	`user_agent` text,
	`user_id` varchar(36) NOT NULL,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`task_id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`description` text NOT NULL,
	`due_date` timestamp,
	`completed` tinyint DEFAULT 0,
	`listing_id` bigint,
	`lead_id` bigint,
	`deal_id` bigint,
	`appointment_id` bigint,
	`prospect_id` bigint,
	`is_active` tinyint DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_task_id` PRIMARY KEY(`task_id`)
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`user_role_id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`role_id` bigint NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`is_active` tinyint DEFAULT 1,
	CONSTRAINT `user_roles_user_role_id` PRIMARY KEY(`user_role_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`name` varchar(200) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` tinyint DEFAULT 0,
	`email_verified_at` timestamp,
	`image` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`password` varchar(255),
	`account_id` bigint NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`phone` varchar(20),
	`timezone` varchar(50) DEFAULT 'UTC',
	`language` varchar(10) DEFAULT 'en',
	`preferences` JSON DEFAULT '{}',
	`last_login` timestamp,
	`is_verified` tinyint DEFAULT 0,
	`is_active` tinyint DEFAULT 1,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `verification_tokens` (
	`id` varchar(36) NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verification_tokens_id` PRIMARY KEY(`id`)
);

*/