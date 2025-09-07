-- Fix user_id column type in cartel_configurations table
-- Change from BIGINT to VARCHAR(36) to match the schema

ALTER TABLE cartel_configurations 
MODIFY COLUMN user_id VARCHAR(36) NULL;