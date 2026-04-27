-- Stores registration data before OTP is verified
-- Users are only inserted into `users` after verification
CREATE TABLE IF NOT EXISTS pending_registrations (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  email      VARCHAR(191) NULL,
  phone      VARCHAR(30)  NULL,
  pass_hash  VARCHAR(255) NOT NULL,
  otp        VARCHAR(6)   NOT NULL,
  expires_at DATETIME     NOT NULL,
  INDEX idx_email (email),
  INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
