# OAuth Connections Aura Association Fix

## Problem
OAuth connections (like Google Fit sensors) were being stored at the user level instead of being associated with specific auras. This caused issues when editing auras because:

1. All OAuth connections for a user were shown for every aura
2. Connections couldn't be properly filtered by aura
3. Users couldn't have different OAuth setups for different auras

## Solution Implemented

### 1. Database Schema Changes
- Added `aura_id` column to `oauth_connections` table
- Added foreign key constraint to `auras` table with CASCADE delete
- Added indexes for better query performance

### 2. API Updates
- **POST /api/oauth-connections**: Now accepts and stores `aura_id` parameter
- **GET /api/oauth-connections**: Now supports filtering by `aura_id` query parameter
- Maintains backward compatibility for connections without `aura_id` (legacy support)

### 3. Frontend Updates
- **EditAuraPage**: Now fetches OAuth connections filtered by specific `aura_id`
- **AuraEditForm**: Passes `aura_id` when creating new OAuth connections
- **SenseSelector**: Added `aura_id` prop and passes it to OAuth modal
- **EnhancedOAuthConnectionModal**: Added `aura_id` prop for connection association
- **Creator Components**: Pass `undefined` for `aura_id` during aura creation

## Files Modified

### Database
- `database-migration-oauth-aura-association.sql` - Migration script
- `database-rollback-oauth-aura-association.sql` - Rollback script

### API Routes
- `apps/web/app/api/oauth-connections/route.ts` - Updated POST and GET endpoints

### Frontend Components
- `apps/web/app/(dashboard)/auras/[id]/edit/page.tsx` - Filter connections by aura
- `apps/web/components/aura/aura-edit-form.tsx` - Pass aura_id to connections
- `apps/web/components/aura/sense-selector.tsx` - Added aura_id prop
- `apps/web/components/aura/enhanced-oauth-connection-modal.tsx` - Added aura_id prop
- `apps/web/components/aura/aura-creator-digital.tsx` - Pass undefined for aura_id
- `apps/web/components/aura/aura-configuration-form.tsx` - Pass undefined for aura_id
- `apps/web/components/aura/aura-creator.tsx` - Pass undefined for aura_id
- `apps/web/components/aura/aura-creator-full.tsx` - Pass undefined for aura_id

## Deployment Steps

### 1. Run Database Migration
Execute the migration script in your database:
```sql
-- Run this in your Supabase SQL editor or database client
\i database-migration-oauth-aura-association.sql
```

### 2. Deploy Code Changes
Deploy all the modified files to your environment.

### 3. Test the Fix
1. Create a new aura
2. Add OAuth connections (like Google Fit) to the aura
3. Edit the aura - verify that only connections for that specific aura are shown
4. Create another aura - verify it starts with no connections
5. Add different connections to the second aura
6. Switch between editing both auras - verify each shows only its own connections

## Backward Compatibility
- Existing OAuth connections without `aura_id` will still work
- The API supports both legacy (user-level) and new (aura-level) connections
- No data loss during migration

## Rollback Plan
If issues occur, run the rollback script:
```sql
\i database-rollback-oauth-aura-association.sql
```

This will remove the `aura_id` column and revert to the previous behavior.

## Future Considerations
- Consider migrating existing orphaned connections to specific auras
- Add UI to move connections between auras if needed
- Monitor for any performance impacts from the new indexes