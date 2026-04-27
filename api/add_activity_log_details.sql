ALTER TABLE activity_log
    ADD COLUMN IF NOT EXISTS details VARCHAR(500) NULL AFTER entity_name;
