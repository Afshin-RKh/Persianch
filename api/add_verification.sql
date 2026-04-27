-- Run this on the BiruniMap database to enable OTP verification

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone VARCHAR(30) NULL AFTER email,
  ADD COLUMN IF NOT EXISTS is_verified TINYINT(1) NOT NULL DEFAULT 0 AFTER phone;

-- Mark all existing users as already verified (don't lock out current users)
UPDATE users SET is_verified = 1 WHERE is_verified = 0;

CREATE TABLE IF NOT EXISTS verification_codes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  code       VARCHAR(8) NOT NULL,
  type       ENUM('email','phone') NOT NULL DEFAULT 'email',
  expires_at DATETIME NOT NULL,
  used_at    DATETIME NULL,
  INDEX idx_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
