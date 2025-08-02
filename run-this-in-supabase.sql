-- Run this SQL in your Supabase SQL Editor
-- This will add the aura_id column to oauth_connections table

-- Step 1: Check if the column already exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'oauth_connections' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Add aura_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'oauth_connections' 
        AND column_name = 'aura_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.oauth_connections 
        ADD COLUMN aura_id uuid REFERENCES public.auras(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added aura_id column to oauth_connections table';
    ELSE
        RAISE NOTICE 'aura_id column already exists in oauth_connections table';
    END IF;
END $$;

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_oauth_connections_aura_id ON public.oauth_connections(aura_id);
CREATE INDEX IF NOT EXISTS idx_oauth_connections_user_aura ON public.oauth_connections(user_id, aura_id);

-- Step 4: Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'oauth_connections' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 5: Check existing data
SELECT COUNT(*) as total_connections FROM public.oauth_connections;
SELECT COUNT(*) as connections_with_aura FROM public.oauth_connections WHERE aura_id IS NOT NULL;
SELECT COUNT(*) as connections_without_aura FROM public.oauth_connections WHERE aura_id IS NULL;