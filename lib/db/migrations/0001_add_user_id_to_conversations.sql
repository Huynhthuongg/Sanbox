-- Migration: Add user_id to conversations table
-- Safe to run multiple times (uses IF NOT EXISTS pattern)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE conversations ADD COLUMN user_id TEXT;
  END IF;
END
$$;
