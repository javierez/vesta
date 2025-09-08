-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  feedback_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(36) NOT NULL,
  account_id BIGINT NOT NULL,
  feedback_comment TEXT NOT NULL,
  scale SMALLINT NOT NULL CHECK (scale >= 1 AND scale <= 4),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  
  -- Foreign key constraints (adjust based on your database setup)
  CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_feedback_account FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);

-- Add index for performance
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_account_id ON feedback(account_id);
CREATE INDEX idx_feedback_created_at ON feedback(created_at);