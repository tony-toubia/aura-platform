-- Migration: OAuth Connection Library System
-- This migration adds support for a shared OAuth connection library
-- where connections can be reused across multiple auras

-- Create the association table between auras and OAuth connections
CREATE TABLE IF NOT EXISTS aura_oauth_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    connection_id UUID NOT NULL REFERENCES oauth_connections(id) ON DELETE CASCADE,
    aura_id UUID NOT NULL REFERENCES auras(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique association between connection and aura
    UNIQUE(connection_id, aura_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_aura_oauth_connections_connection_id ON aura_oauth_connections(connection_id);
CREATE INDEX IF NOT EXISTS idx_aura_oauth_connections_aura_id ON aura_oauth_connections(aura_id);
CREATE INDEX IF NOT EXISTS idx_aura_oauth_connections_created_at ON aura_oauth_connections(created_at);

-- Add index on oauth_connections.aura_id for library queries (where aura_id IS NULL)
CREATE INDEX IF NOT EXISTS idx_oauth_connections_aura_id_null ON oauth_connections(user_id) WHERE aura_id IS NULL;

-- Add RLS policies for the association table
ALTER TABLE aura_oauth_connections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see associations for their own connections and auras
CREATE POLICY "Users can view their own aura OAuth connection associations" ON aura_oauth_connections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM oauth_connections oc 
            WHERE oc.id = aura_oauth_connections.connection_id 
            AND oc.user_id = auth.uid()
        )
        AND
        EXISTS (
            SELECT 1 FROM auras a 
            WHERE a.id = aura_oauth_connections.aura_id 
            AND a.user_id = auth.uid()
        )
    );

-- Policy: Users can create associations for their own connections and auras
CREATE POLICY "Users can create their own aura OAuth connection associations" ON aura_oauth_connections
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM oauth_connections oc 
            WHERE oc.id = aura_oauth_connections.connection_id 
            AND oc.user_id = auth.uid()
        )
        AND
        EXISTS (
            SELECT 1 FROM auras a 
            WHERE a.id = aura_oauth_connections.aura_id 
            AND a.user_id = auth.uid()
        )
    );

-- Policy: Users can delete associations for their own connections and auras
CREATE POLICY "Users can delete their own aura OAuth connection associations" ON aura_oauth_connections
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM oauth_connections oc 
            WHERE oc.id = aura_oauth_connections.connection_id 
            AND oc.user_id = auth.uid()
        )
        AND
        EXISTS (
            SELECT 1 FROM auras a 
            WHERE a.id = aura_oauth_connections.aura_id 
            AND a.user_id = auth.uid()
        )
    );

-- Create a function to safely delete OAuth connections from library
-- This function will only delete a connection if it's not associated with any auras
CREATE OR REPLACE FUNCTION delete_oauth_connection_from_library(connection_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    connection_exists BOOLEAN;
    has_associations BOOLEAN;
    connection_user_id UUID;
BEGIN
    -- Check if connection exists and get its user_id
    SELECT EXISTS(SELECT 1 FROM oauth_connections WHERE id = connection_uuid AND aura_id IS NULL), user_id
    INTO connection_exists, connection_user_id
    FROM oauth_connections 
    WHERE id = connection_uuid AND aura_id IS NULL;
    
    -- Return false if connection doesn't exist or doesn't belong to current user
    IF NOT connection_exists OR connection_user_id != auth.uid() THEN
        RETURN FALSE;
    END IF;
    
    -- Check if connection has any associations
    SELECT EXISTS(SELECT 1 FROM aura_oauth_connections WHERE connection_id = connection_uuid)
    INTO has_associations;
    
    -- If no associations, safe to delete
    IF NOT has_associations THEN
        DELETE FROM oauth_connections WHERE id = connection_uuid AND user_id = auth.uid();
        RETURN TRUE;
    END IF;
    
    -- Has associations, cannot delete
    RETURN FALSE;
END;
$$;

-- Create a function to get OAuth connections for an aura (including library connections)
CREATE OR REPLACE FUNCTION get_aura_oauth_connections(aura_uuid UUID)
RETURNS TABLE (
    id UUID,
    provider TEXT,
    provider_user_id TEXT,
    sense_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    device_info JSONB,
    is_library_connection BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verify user owns the aura
    IF NOT EXISTS(SELECT 1 FROM auras WHERE auras.id = aura_uuid AND user_id = auth.uid()) THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    -- Get direct aura connections (legacy)
    SELECT 
        oc.id,
        oc.provider,
        oc.provider_user_id,
        oc.sense_type,
        oc.created_at,
        oc.expires_at,
        oc.scope,
        oc.device_info,
        FALSE as is_library_connection
    FROM oauth_connections oc
    WHERE oc.aura_id = aura_uuid
    AND oc.user_id = auth.uid()
    
    UNION ALL
    
    -- Get library connections associated with this aura
    SELECT 
        oc.id,
        oc.provider,
        oc.provider_user_id,
        oc.sense_type,
        oc.created_at,
        oc.expires_at,
        oc.scope,
        oc.device_info,
        TRUE as is_library_connection
    FROM oauth_connections oc
    INNER JOIN aura_oauth_connections aoc ON oc.id = aoc.connection_id
    WHERE aoc.aura_id = aura_uuid
    AND oc.user_id = auth.uid()
    AND oc.aura_id IS NULL
    
    ORDER BY created_at DESC;
END;
$$;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION delete_oauth_connection_from_library(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_aura_oauth_connections(UUID) TO authenticated;