-- SQL to create user_comments table in MySQL database
-- This table is for contact-based comments (similar to property comments but for contacts)

CREATE TABLE user_comments (
    comment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contact_id BIGINT NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    parent_id BIGINT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    
    -- Foreign key constraints
    FOREIGN KEY (contact_id) REFERENCES contacts(contact_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES user_comments(comment_id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_user_comments_contact_id (contact_id),
    INDEX idx_user_comments_user_id (user_id),
    INDEX idx_user_comments_parent_id (parent_id),
    INDEX idx_user_comments_created_at (created_at)
);
