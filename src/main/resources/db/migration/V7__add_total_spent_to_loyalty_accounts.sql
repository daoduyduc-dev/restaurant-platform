-- Add missing total_spent column to loyalty_accounts table if it doesn't exist
ALTER TABLE loyalty_accounts
ADD COLUMN IF NOT EXISTS total_spent numeric(12, 2) NOT NULL DEFAULT 0;
