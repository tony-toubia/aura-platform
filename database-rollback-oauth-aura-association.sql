-- Database Rollback: Remove OAuth Connections Aura Association
-- This rollback script removes the aura_id column and indexes added by the migration
-- WARNING: This will remove the association between OAuth connections and specific auras

-- Step 1: Drop the indexes
DROP INDEX IF EXISTS idx_oauth_connections_user_aura;
DROP INDEX IF EXISTS idx_oauth_connections_aura_id;

-- Step 2: Remove the aura_id column
ALTER TABLE public.oauth_connections DROP COLUMN IF EXISTS aura_id;

-- Verification query (run this to verify the rollback worked):
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'oauth_connections' AND table_schema = 'public';