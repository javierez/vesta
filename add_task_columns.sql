-- Add new columns to tasks table
-- Run this SQL script to add completedBy, editedBy, and category columns

ALTER TABLE tasks
ADD COLUMN completed_by VARCHAR(36) NULL COMMENT 'FK → users.id (who completed the task)',
ADD COLUMN edited_by VARCHAR(36) NULL COMMENT 'FK → users.id (who last edited the task)',
ADD COLUMN category VARCHAR(100) NULL COMMENT 'Task category/type';

-- Verify the columns were added
DESCRIBE tasks;
