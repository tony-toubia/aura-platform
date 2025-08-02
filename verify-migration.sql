-- Run this in Supabase SQL Editor to verify the migration worked

-- Check the oauth_connections table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'oauth_connections' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there are any existing oauth_connections
SELECT * FROM public.oauth_connections ORDER BY created_at DESC LIMIT 10;

-- Check if there are any auras to connect to
SELECT id, name, user_id, created_at FROM public.auras ORDER BY created_at DESC LIMIT 5;