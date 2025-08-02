-- REQUIRED: Add aura_id column to oauth_connections table
-- Run this in your Supabase SQL Editor

-- Step 1: Add the aura_id column
ALTER TABLE public.oauth_connections 
ADD COLUMN aura_id uuid REFERENCES public.auras(id) ON DELETE CASCADE;

-- Step 2: Create indexes for better performance
CREATE INDEX idx_oauth_connections_aura_id ON public.oauth_connections(aura_id);
CREATE INDEX idx_oauth_connections_user_aura ON public.oauth_connections(user_id, aura_id);

-- Step 3: Verify the migration
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'oauth_connections' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Expected output should include:
-- aura_id | uuid | YES | (null)

-- Step 4: Check if there are any existing oauth_connections that need migration
SELECT COUNT(*) as existing_connections FROM public.oauth_connections;

-- If you have existing connections, you might want to associate them with auras:
-- UPDATE public.oauth_connections 
-- SET aura_id = (
--   SELECT id FROM public.auras 
--   WHERE user_id = oauth_connections.user_id 
--   ORDER BY created_at DESC 
--   LIMIT 1
-- )
-- WHERE aura_id IS NULL;