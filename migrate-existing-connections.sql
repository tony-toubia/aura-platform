-- Migrate existing OAuth connections to associate them with auras
-- This will assign each connection to the user's most recent aura

-- First, let's see what we're working with
SELECT 
  'Before migration:' as status,
  COUNT(*) as total_connections,
  COUNT(aura_id) as connections_with_aura_id,
  COUNT(*) - COUNT(aura_id) as connections_without_aura_id
FROM public.oauth_connections;

-- Show the connections that need migration
SELECT 
  oc.id,
  oc.provider,
  oc.sense_type,
  oc.user_id,
  oc.aura_id,
  oc.created_at as connection_created
FROM public.oauth_connections oc
WHERE oc.aura_id IS NULL
ORDER BY oc.created_at DESC;

-- Update connections without aura_id to use the user's most recent aura
UPDATE public.oauth_connections 
SET aura_id = (
  SELECT a.id 
  FROM public.auras a 
  WHERE a.user_id = oauth_connections.user_id 
  ORDER BY a.created_at DESC 
  LIMIT 1
)
WHERE aura_id IS NULL;

-- Verify the migration
SELECT 
  'After migration:' as status,
  COUNT(*) as total_connections,
  COUNT(aura_id) as connections_with_aura_id,
  COUNT(*) - COUNT(aura_id) as connections_without_aura_id
FROM public.oauth_connections;

-- Show the updated connections
SELECT 
  oc.id,
  oc.provider,
  oc.sense_type,
  oc.user_id,
  oc.aura_id,
  a.name as aura_name,
  oc.created_at as connection_created
FROM public.oauth_connections oc
LEFT JOIN public.auras a ON oc.aura_id = a.id
ORDER BY oc.created_at DESC;