-- Add device_info column to oauth_connections table
-- This will store browser and device information for location connections

-- Step 1: Add device_info column as JSONB to store structured device information
ALTER TABLE public.oauth_connections
ADD COLUMN device_info JSONB;

-- Step 2: Add a comment to document the column
COMMENT ON COLUMN public.oauth_connections.device_info IS 'Stores device information like browser, OS, platform for location-based connections';

-- Step 3: Create an index for better query performance on device_info
CREATE INDEX IF NOT EXISTS idx_oauth_connections_device_info ON public.oauth_connections USING GIN (device_info);

-- Step 4: Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'oauth_connections' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 5: Show example of what device_info will contain
-- Example device_info structure:
-- {
--   "browser": "Chrome",
--   "os": "Windows", 
--   "platform": "Win32",
--   "language": "en-US",
--   "screenInfo": "1920x1080",
--   "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."
-- }