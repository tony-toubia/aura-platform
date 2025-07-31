-- Optional database cleanup SQL (only run if you're sure you don't want companion vessels)
-- WARNING: This will remove wildlife tracking functionality

-- 1. Remove wildlife tracking columns from auras table
ALTER TABLE public.auras 
DROP COLUMN IF EXISTS selected_study_id,
DROP COLUMN IF EXISTS selected_individual_id;

-- 2. Drop wildlife_tracks table
DROP TABLE IF EXISTS public.wildlife_tracks;

-- 3. Update vessel_type enum to remove companion (if you have custom enum)
-- Note: You may need to update this based on your actual enum definition
-- ALTER TYPE vessel_type DROP VALUE IF EXISTS 'companion';

-- 4. Clean up any existing companion auras (optional)
-- DELETE FROM public.auras WHERE vessel_type = 'companion';