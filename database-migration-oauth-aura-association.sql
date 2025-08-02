-- Database Migration: Associate OAuth Connections with Specific Auras
-- This migration adds aura_id column to oauth_connections table to properly associate
-- OAuth connections with specific auras instead of just users.

-- Step 1: Add aura_id column to oauth_connections table
ALTER TABLE public.oauth_connections 
ADD COLUMN aura_id uuid REFERENCES public.auras(id) ON DELETE CASCADE;

-- Step 2: Create indexes for better query performance
CREATE INDEX idx_oauth_connections_aura_id ON public.oauth_connections(aura_id);
CREATE INDEX idx_oauth_connections_user_aura ON public.oauth_connections(user_id, aura_id);

-- Step 3: Update the updated_at column to track when this migration was applied
UPDATE public.oauth_connections SET updated_at = now() WHERE aura_id IS NULL;

-- Optional: If you want to migrate existing connections to a specific aura
-- (Uncomment and modify the following query if needed)
-- 
-- UPDATE public.oauth_connections 
-- SET aura_id = (
--   SELECT id FROM public.auras 
--   WHERE user_id = oauth_connections.user_id 
--   ORDER BY created_at DESC 
--   LIMIT 1
-- )
-- WHERE aura_id IS NULL;

-- Verification queries (run these to verify the migration worked):
-- SELECT COUNT(*) as total_connections FROM public.oauth_connections;
-- SELECT COUNT(*) as connections_with_aura FROM public.oauth_connections WHERE aura_id IS NOT NULL;
-- SELECT COUNT(*) as connections_without_aura FROM public.oauth_connections WHERE aura_id IS NULL;