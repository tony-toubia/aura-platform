-- Check the existing OAuth connections
SELECT 
  id,
  provider,
  sense_type,
  provider_user_id,
  aura_id,
  user_id,
  created_at
FROM public.oauth_connections 
ORDER BY created_at DESC;

-- Check if any connections have aura_id set
SELECT 
  COUNT(*) as total_connections,
  COUNT(aura_id) as connections_with_aura_id,
  COUNT(*) - COUNT(aura_id) as connections_without_aura_id
FROM public.oauth_connections;

-- Check available auras for reference
SELECT 
  id,
  name,
  user_id,
  created_at
FROM public.auras 
ORDER BY created_at DESC;