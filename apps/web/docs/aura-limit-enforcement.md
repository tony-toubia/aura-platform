# Aura Limit Enforcement System

This document describes the comprehensive solution for handling subscription downgrades and aura limits in the Aura Platform.

## Overview

When users downgrade their subscription (e.g., from Family to Personal, or from Personal to Free), they may have more active auras than their new subscription tier allows. This system automatically handles these scenarios by:

1. **Detecting subscription changes** via Stripe webhooks
2. **Automatically disabling excess auras** when limits are exceeded
3. **Preventing access to disabled auras** via middleware
4. **Providing user interface** for managing over-limit scenarios
5. **Offering upgrade paths** to restore full functionality

## Subscription Tiers & Limits

| Tier | Max Active Auras | Price |
|------|------------------|-------|
| Free (Starter) | 1 | $0 |
| Personal | 3 | $9.99 |
| Family | 10 | $19.99 |
| Business | Unlimited | $49.99 |

## System Components

### 1. AuraLimitService (`apps/web/lib/services/aura-limit-service.ts`)

Core service that handles all aura limit logic:

- `checkAuraLimitStatus()` - Check if user is over their limit
- `enforceAuraLimits()` - Disable excess auras when subscription changes
- `canEnableAura()` - Check if an aura can be enabled
- `enableAuraWithLimitCheck()` - Enable aura with limit validation
- `getAuraPrioritySuggestions()` - Get smart suggestions for which auras to keep

### 2. Enhanced SubscriptionService (`apps/web/lib/services/subscription-service.ts`)

Modified to detect downgrades and trigger limit enforcement:

```typescript
// In webhook handler
if (newTierIndex < currentTierIndex) {
  console.log('🔽 Subscription downgrade detected, enforcing aura limits...')
  const enforcementResult = await AuraLimitService.enforceAuraLimits(userId, newTierId)
  // Logs disabled auras for audit purposes
}
```

### 3. API Endpoints

#### `/api/auras/limit-management` 
- `GET` - Get limit status and aura management data
- `POST` - Enable/disable auras with limit checking

### 4. User Interface Components

#### AuraLimitManager (`apps/web/components/aura/aura-limit-manager.tsx`)
Comprehensive dialog for managing auras when over limits:
- Shows current status vs limits
- Lists active and disabled auras with priority scores
- Allows enabling/disabling auras within limits
- Provides upgrade prompts

#### AuraLimitNotification (`apps/web/components/aura/aura-limit-notification.tsx`)
Alert notification shown when users are redirected due to limit violations.

#### Enhanced AurasList (`apps/web/components/aura/auras-list.tsx`)
- Integrates limit management functionality
- Shows "Manage Auras" button
- Uses new limit-aware toggle logic

### 5. Middleware Protection (`apps/web/lib/middleware/aura-limit-middleware.ts`)

Prevents access to disabled auras by redirecting users to the management interface.

### 6. Database Migration (`apps/web/supabase/migrations/20250805_aura_limit_enforcement.sql`)

Adds database optimizations and audit logging:
- Performance indexes for limit queries
- Optional database-level enforcement function
- Subscription change audit log
- Helper functions for logging changes

## How It Works

### Subscription Downgrade Flow

1. **User downgrades subscription** in Stripe
2. **Stripe webhook fires** with subscription update
3. **SubscriptionService detects downgrade** by comparing tier hierarchy
4. **AuraLimitService.enforceAuraLimits()** is called
5. **Excess auras are disabled** (oldest first, by creation date)
6. **Audit log entry created** (optional)
7. **User sees notification** on next visit to auras page

### Aura Access Flow

1. **User tries to access specific aura** (chat, edit, etc.)
2. **Middleware checks if aura is disabled** due to limits
3. **If disabled, user is redirected** to auras page with notification
4. **User can manage auras** via the limit management interface
5. **User can upgrade subscription** to restore access

### Priority-Based Disabling

When disabling excess auras, the system uses a smart priority algorithm:

```typescript
// Higher score = higher priority to keep active
let score = 0
score += Math.max(0, 30 - daysSinceUpdate) // Recency bonus (up to 30 points)
score += senseCount * 5 // Complexity bonus (5 points per sense)
score += ruleCount * 3 // Rule complexity bonus (3 points per rule)
```

Auras with **lower** priority scores are disabled first (oldest, least complex auras).

## Testing the Solution

### Manual Testing Steps

1. **Create test user with multiple auras**
   ```bash
   # Create user with Family subscription (10 auras max)
   # Create 5+ auras for testing
   ```

2. **Simulate subscription downgrade**
   ```bash
   # Use Stripe CLI to send webhook:
   stripe trigger customer.subscription.updated
   # Or manually update subscription in database
   ```

3. **Verify automatic enforcement**
   - Check that excess auras are disabled
   - Verify audit log entries
   - Test middleware redirects

4. **Test user interface**
   - Visit `/auras` page
   - Click "Manage Auras" button
   - Try enabling/disabling auras
   - Test upgrade flow

### API Testing

```bash
# Check limit status
curl -X GET /api/auras/limit-management \
  -H "Authorization: Bearer <token>"

# Try to enable aura
curl -X POST /api/auras/limit-management \
  -H "Content-Type: application/json" \
  -d '{"action": "enable", "auraId": "aura-123"}'

# Try to disable aura
curl -X POST /api/auras/limit-management \
  -H "Content-Type: application/json" \
  -d '{"action": "disable", "auraId": "aura-123"}'
```

### Database Testing

```sql
-- Check current aura status
SELECT id, name, enabled, created_at 
FROM auras 
WHERE user_id = 'user-123' 
ORDER BY created_at;

-- Check subscription audit log
SELECT * FROM subscription_audit_log 
WHERE user_id = 'user-123' 
ORDER BY created_at DESC;

-- Manually test enforcement function
SELECT enforce_aura_limits() FROM auras WHERE id = 'test-aura';
```

## Error Handling

The system is designed to be resilient:

- **Webhook failures don't block subscription updates** - limit enforcement errors are logged but don't fail the webhook
- **Middleware errors don't block requests** - users can still access the platform if middleware fails
- **API errors are gracefully handled** - UI shows appropriate error messages
- **Database constraints prevent data corruption** - optional triggers provide additional safety

## Monitoring & Observability

Key metrics to monitor:

- **Subscription downgrade events** - Track frequency and patterns
- **Aura enforcement actions** - Number of auras disabled per downgrade
- **User upgrade conversions** - Users who upgrade after hitting limits
- **Error rates** - Failed enforcement attempts or API errors

Log entries to watch for:

```
🔽 Subscription downgrade detected, enforcing aura limits...
✅ Aura limit enforcement completed: {...}
🚫 Disabled X auras due to downgrade: [...]
❌ Failed to enforce aura limits: {...}
```

## Future Enhancements

Potential improvements:

1. **Grace period** - Allow temporary over-limit usage for X days
2. **Smart suggestions** - ML-based recommendations for which auras to keep
3. **Bulk operations** - Enable/disable multiple auras at once
4. **Usage analytics** - Show aura usage stats to help users decide
5. **Temporary upgrades** - One-time payments to exceed limits temporarily

## Security Considerations

- **User isolation** - Users can only manage their own auras
- **Subscription validation** - All limits are validated against current subscription
- **Audit logging** - All changes are logged for compliance
- **Rate limiting** - API endpoints should be rate limited to prevent abuse
- **Input validation** - All user inputs are validated and sanitized

## Performance Considerations

- **Database indexes** - Added for efficient limit queries
- **Caching** - Consider caching subscription data for frequently accessed users
- **Batch operations** - Webhook processing handles multiple auras efficiently
- **Async processing** - Limit enforcement doesn't block user requests

This system provides a comprehensive, user-friendly solution for handling subscription downgrades while maintaining data integrity and providing clear upgrade paths.