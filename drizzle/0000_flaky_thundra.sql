CREATE TABLE `accounts` (
	`account_id` bigint AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`logo` varchar(2048),
	`address` varchar(500),
	`phone` varchar(20),
	`email` varchar(255),
	`website` varchar(255),
	`portal_settings` json DEFAULT '{}',
	`payment_settings` json DEFAULT '{}',
	`preferences` json DEFAULT '{}',
	`plan` varchar(50) DEFAULT 'basic',
	`subscription_status` varchar(20) DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`is_active` boolean DEFAULT true,
	CONSTRAINT `accounts_account_id` PRIMARY KEY(`account_id`)
);
--> statement-breakpoint
CREATE TABLE `appointments` (
	`appointment_id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` bigint NOT NULL,
	`contact_id` bigint NOT NULL,
	`listing_id` bigint,
	`lead_id` bigint,
	`deal_id` bigint,
	`prospect_id` bigint,
	`datetime_start` timestamp NOT NULL,
	`datetime_end` timestamp NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'Scheduled',
	`notes` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_appointment_id` PRIMARY KEY(`appointment_id`)
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`contact_id` bigint AUTO_INCREMENT NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`email` varchar(255),
	`phone` varchar(20),
	`additional_info` json DEFAULT '{}',
	`org_id` bigint,
	`is_active` boolean DEFAULT true,
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
	`user_id` bigint NOT NULL,
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
	`is_active` boolean DEFAULT true,
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
	`is_active` boolean DEFAULT true,
	CONSTRAINT `listing_contacts_listing_contact_id` PRIMARY KEY(`listing_contact_id`)
);
--> statement-breakpoint
CREATE TABLE `listings` (
	`listing_id` bigint AUTO_INCREMENT NOT NULL,
	`property_id` bigint NOT NULL,
	`agent_id` bigint NOT NULL,
	`listing_type` varchar(20) NOT NULL,
	`price` decimal(12,2) NOT NULL,
	`status` varchar(20) NOT NULL,
	`is_furnished` boolean,
	`furniture_quality` varchar(50),
	`optional_garage` boolean,
	`optional_garage_price` decimal(12,2),
	`optional_storage_room` boolean NOT NULL DEFAULT false,
	`optional_storage_room_price` decimal(12,2),
	`has_keys` boolean NOT NULL DEFAULT false,
	`student_friendly` boolean,
	`pets_allowed` boolean,
	`appliances_included` boolean,
	`internet` boolean DEFAULT false,
	`oven` boolean DEFAULT false,
	`microwave` boolean DEFAULT false,
	`washing_machine` boolean DEFAULT false,
	`fridge` boolean DEFAULT false,
	`tv` boolean DEFAULT false,
	`stoneware` boolean DEFAULT false,
	`is_featured` boolean DEFAULT false,
	`is_bank_owned` boolean DEFAULT false,
	`is_active` boolean DEFAULT true,
	`visibility_mode` smallint DEFAULT 1,
	`view_count` int DEFAULT 0,
	`inquiry_count` int DEFAULT 0,
	`fotocasa` boolean DEFAULT false,
	`idealista` boolean DEFAULT false,
	`habitaclia` boolean DEFAULT false,
	`pisoscom` boolean DEFAULT false,
	`yaencontre` boolean DEFAULT false,
	`milanuncios` boolean DEFAULT false,
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
	`is_active` boolean DEFAULT true,
	CONSTRAINT `locations_neighborhood_id` PRIMARY KEY(`neighborhood_id`)
);
--> statement-breakpoint
CREATE TABLE `oauth_accounts` (
	`id` varchar(36) NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` bigint NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp,
	`refresh_token_expires_at` timestamp,
	`scope` text,
	`password` text,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `oauth_accounts_id` PRIMARY KEY(`id`)
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
	`has_heating` boolean DEFAULT false,
	`heating_type` varchar(50),
	`has_elevator` boolean DEFAULT false,
	`has_garage` boolean DEFAULT false,
	`has_storage_room` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`is_active` boolean DEFAULT true,
	`garage_type` varchar(50),
	`garage_spaces` smallint,
	`garage_in_building` boolean,
	`elevator_to_garage` boolean,
	`garage_number` varchar(20),
	`gym` boolean DEFAULT false,
	`sports_area` boolean DEFAULT false,
	`children_area` boolean DEFAULT false,
	`suite_bathroom` boolean DEFAULT false,
	`nearby_public_transport` boolean DEFAULT false,
	`community_pool` boolean DEFAULT false,
	`private_pool` boolean DEFAULT false,
	`tennis_court` boolean DEFAULT false,
	`disabled_accessible` boolean,
	`vpo` boolean,
	`video_intercom` boolean,
	`concierge_service` boolean,
	`security_guard` boolean,
	`satellite_dish` boolean,
	`double_glazing` boolean,
	`alarm` boolean,
	`security_door` boolean,
	`brand_new` boolean,
	`new_construction` boolean,
	`under_construction` boolean,
	`needs_renovation` boolean,
	`last_renovation_year` smallint,
	`kitchen_type` varchar(50),
	`hot_water_type` varchar(50),
	`open_kitchen` boolean,
	`french_kitchen` boolean,
	`furnished_kitchen` boolean,
	`pantry` boolean,
	`storage_room_size` int,
	`storage_room_number` varchar(20),
	`terrace` boolean,
	`terrace_size` int,
	`wine_cellar` boolean,
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
	`exterior` boolean,
	`bright` boolean,
	`views` boolean,
	`mountain_views` boolean,
	`sea_views` boolean,
	`beachfront` boolean,
	`jacuzzi` boolean,
	`hydromassage` boolean,
	`garden` boolean,
	`pool` boolean,
	`home_automation` boolean,
	`music_system` boolean,
	`laundry_room` boolean,
	`covered_clothesline` boolean,
	`fireplace` boolean,
	CONSTRAINT `properties_property_id` PRIMARY KEY(`property_id`)
);
--> statement-breakpoint
CREATE TABLE `property_images` (
	`property_image_id` bigint AUTO_INCREMENT NOT NULL,
	`property_id` bigint NOT NULL,
	`reference_number` varchar(32) NOT NULL,
	`image_url` varchar(255) NOT NULL,
	`is_active` boolean DEFAULT true,
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
	`changed_by` bigint NOT NULL,
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
	`preferred_areas` json,
	`min_bedrooms` smallint,
	`min_bathrooms` smallint,
	`min_square_meters` int,
	`max_square_meters` int,
	`move_in_by` timestamp,
	`extras` json,
	`urgency_level` smallint,
	`funding_ready` boolean,
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
	`permissions` json DEFAULT '{}',
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`is_active` boolean DEFAULT true,
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
	`user_id` bigint NOT NULL,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`task_id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` bigint NOT NULL,
	`description` text NOT NULL,
	`due_date` timestamp,
	`completed` boolean DEFAULT false,
	`listing_id` bigint,
	`lead_id` bigint,
	`deal_id` bigint,
	`appointment_id` bigint,
	`prospect_id` bigint,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_task_id` PRIMARY KEY(`task_id`)
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`user_role_id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` bigint NOT NULL,
	`role_id` bigint NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`is_active` boolean DEFAULT true,
	CONSTRAINT `user_roles_user_role_id` PRIMARY KEY(`user_role_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`user_id` bigint AUTO_INCREMENT NOT NULL,
	`account_id` bigint NOT NULL,
	`email` varchar(255) NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`phone` varchar(20),
	`profile_image_url` varchar(255),
	`timezone` varchar(50) DEFAULT 'UTC',
	`language` varchar(10) DEFAULT 'en',
	`preferences` json DEFAULT '{}',
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`last_login` timestamp,
	`is_verified` boolean DEFAULT false,
	`is_active` boolean DEFAULT true,
	`password` varchar(255),
	`email_verified` boolean DEFAULT false,
	`email_verified_at` timestamp,
	CONSTRAINT `users_user_id` PRIMARY KEY(`user_id`)
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
