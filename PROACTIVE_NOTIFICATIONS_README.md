# Proactive Notifications System

This document provides a comprehensive guide to the Proactive Notifications system implemented for the Aura Platform, enabling auras to send notifications when behavior rules are triggered without user-initiated interaction.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Installation & Setup](#installation--setup)
- [API Endpoints](#api-endpoints)
- [Components](#components)
- [Database Schema](#database-schema)
- [Configuration](#configuration)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## 🌟 Overview

The Proactive Notifications system allows auras to:
- **Continuously monitor** sensor data (weather, calendar, fitness, news)
- **Evaluate behavior rules** in the background every 5-15 minutes
- **Send notifications** via multiple channels (in-app, web push, SMS, WhatsApp)
- **Respect user preferences** including quiet hours and rate limiting
- **Scale based on subscription tiers** with different limits and features

## 🏗️ Architecture

### Core Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Cron Jobs     │───▶│  Rule Evaluator  │───▶│ Notification    │
│                 │    │     Worker       │    │    Service      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │  Sensor Data     │    │   Delivery      │
                       │    Service       │    │   Channels      │
                       └──────────────────┘    └─────────────────┘
                                                        │
                                          ┌─────────────┼─────────────┐
                                          ▼             ▼             ▼
                                    ┌──────────┐ ┌──────────┐ ┌──────────┐
                                    │ In-App   │ │ Web Push │ │   SMS    │
                                    │Messenger │ │ Service  │ │ Service  │
                                    └──────────┘ └──────────┘ └──────────┘
```

### Key Services

1. **RuleEvaluatorWorker**: Batch processes auras and evaluates their rules
2. **NotificationService**: Routes and delivers notifications across channels
3. **InAppMessenger**: Handles in-app message delivery and real-time updates
4. **SensorDataService**: Fetches and caches external data sources

## ✨ Features

### ✅ Implemented Features

- **🔄 Background Rule Evaluation**: Continuous monitoring every 5-15 minutes
- **📱 In-App Messaging**: Messages appear in aura conversations  
- **⚙️ User Preferences**: Channel-specific settings with quiet hours
- **📊 Analytics & History**: Track notification performance and history
- **🎚️ Tier-based Limits**: Different capabilities by subscription level
- **🔒 Security**: Row-level security and cron secret authentication
- **📈 Monitoring**: Background job tracking and health checks
- **🧪 Testing**: Test notification endpoints for validation

### 🔄 Delivery Channels

| Channel | Status | Tiers | Description |
|---------|--------|-------|-------------|
| In-App | ✅ Complete | All | Messages in conversations |
| Web Push | 🚧 Framework | Personal+ | Browser notifications |
| SMS | 🚧 Framework | Family+ | Text messages via Twilio |
| WhatsApp | 🚧 Framework | Business | WhatsApp Business API |
| Email | 🚧 Framework | Business | Email notifications |

### 📊 Subscription Tiers

| Tier | Frequency | Daily Limit | Max Rules | Channels |
|------|-----------|-------------|-----------|----------|
| **Free** | 30 min | 10 | 3 | In-App |
| **Personal** | 15 min | 50 | 10 | In-App, Web Push |
| **Family** | 5 min | 200 | 25 | In-App, Web Push, SMS |
| **Business** | 1 min | Unlimited | Unlimited | All |

## 🚀 Installation & Setup

### 1. Database Migration

Run the database migration to create required tables:

```bash
# Apply the migration
psql -h your-host -U your-user -d your-database -f database-migration-proactive-notifications.sql
```

### 2. Environment Variables

Add to your `.env` file:

```bash
# Proactive Notifications Configuration
CRON_SECRET=your-secure-cron-secret-here
RULE_EVALUATION_BATCH_SIZE=50
RULE_EVALUATION_TIMEOUT=30000
SENSOR_DATA_CACHE_TTL=600
NOTIFICATION_QUEUE_BATCH_SIZE=100

# Optional: External service credentials
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_FROM_PHONE=+1234567890

VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:your-email@example.com
```

### 3. Cron Jobs Setup

Set up automated jobs using one of these methods:

#### Vercel (Recommended)
Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/evaluate-rules",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/process-notifications",
      "schedule": "*/1 * * * *"
    }
  ]
}
```

#### Google Cloud Scheduler
```bash
gcloud scheduler jobs create http proactive-rule-evaluation \
  --schedule="*/5 * * * *" \
  --uri="https://your-domain.com/api/cron/evaluate-rules" \
  --http-method=POST \
  --headers="x-cron-secret=YOUR_CRON_SECRET"
```

See [cron-setup.md](./cron-setup.md) for detailed instructions.

### 4. Prisma Schema Update

The Prisma schema has been updated with new models. Run:

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes (if not using migrations)
npx prisma db push
```

## 🔌 API Endpoints

### Notification Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notifications/preferences` | Get user preferences |
| `PUT` | `/api/notifications/preferences` | Update preferences |
| `GET` | `/api/notifications/history` | Get notification history |
| `PATCH` | `/api/notifications/{id}/read` | Mark as read |
| `POST` | `/api/notifications/test` | Send test notification |

### Cron Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/cron/evaluate-rules` | Trigger rule evaluation |
| `GET` | `/api/cron/evaluate-rules` | Health check |
| `POST` | `/api/cron/process-notifications` | Process notification queue |
| `GET` | `/api/cron/process-notifications` | Queue statistics |

### Example Usage

```typescript
// Update notification preferences
const response = await fetch('/api/notifications/preferences', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    auraId: 'aura-123',
    channel: 'IN_APP',
    settings: {
      enabled: true,
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '07:00',
        timezone: 'America/New_York'
      },
      maxPerDay: 20
    }
  })
})

// Send test notification
const testResponse = await fetch('/api/notifications/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    auraId: 'aura-123',
    channel: 'IN_APP',
    message: 'Test notification message'
  })
})
```

## 🧩 Components

### React Components

| Component | Purpose |
|-----------|---------|
| `NotificationDashboard` | Main dashboard with overview, settings, history |
| `NotificationSettings` | Channel-specific preference configuration |
| `NotificationHistory` | Paginated notification history with filtering |
| `NotificationBadge` | Unread count badge with positioning wrapper |

### Hooks

- **`useNotifications()`**: Complete notification management hook
  - Preferences loading and updating
  - History pagination and filtering  
  - Real-time unread count updates
  - Test notification sending

### Usage Examples

```tsx
import { NotificationDashboard } from '@/components/notifications/notification-dashboard'
import { useNotifications } from '@/hooks/use-notifications'

function MyPage() {
  const { unreadCount, updatePreferences } = useNotifications()
  
  return (
    <NotificationDashboard 
      auras={userAuras}
      selectedAuraId={selectedAuraId}
      onAuraSelect={setSelectedAuraId}
    />
  )
}
```

## 🗄️ Database Schema

### New Tables

- **`proactive_messages`**: Stores sent notifications
- **`rule_execution_log`**: Tracks rule evaluation history  
- **`notification_preferences`**: User notification settings
- **`notification_delivery_log`**: Delivery attempt tracking
- **`push_subscriptions`**: Web push subscription storage
- **`background_jobs`**: Background job tracking

### Updated Tables

- **`behavior_rules`**: Added notification templates and channels
- **`auras`**: Added proactive enablement and evaluation timestamps
- **`conversations`**: Added unread proactive message counters

### Key Relationships

```sql
proactive_messages
├── belongs_to: auras
├── belongs_to: behavior_rules (optional)
├── belongs_to: conversations  
└── has_many: notification_delivery_log

notification_preferences
├── belongs_to: users
└── belongs_to: auras (optional, for aura-specific settings)
```

## ⚙️ Configuration

### Rule Evaluator Settings

```typescript
// Default configuration
const config = {
  batchSize: 50,              // Auras per batch
  evaluationTimeout: 30000,   // Max time per evaluation (ms)
  sensorDataTTL: 600,         // Cache TTL (seconds)
  maxRetries: 3               // Max retry attempts
}
```

### Notification Preferences Structure

```typescript
interface NotificationPreference {
  userId: string
  auraId?: string              // null = global preference
  channel: 'IN_APP' | 'WEB_PUSH' | 'SMS' | 'WHATSAPP' | 'EMAIL'
  enabled: boolean
  quietHoursEnabled: boolean
  quietHoursStart?: string     // "HH:MM"
  quietHoursEnd?: string       // "HH:MM"  
  timezone: string             // IANA timezone
  maxPerDay?: number          // Rate limiting
  priorityThreshold: number    // Minimum rule priority
}
```

## 📊 Monitoring

### Health Check Queries

```sql
-- Check recent background jobs
SELECT job_type, status, created_at, error_message 
FROM background_jobs 
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Check notification queue size
SELECT COUNT(*) as queued, delivery_channel
FROM proactive_messages 
WHERE status = 'QUEUED'
GROUP BY delivery_channel;

-- Check delivery success rates (last 24h)
SELECT 
  delivery_channel,
  COUNT(*) as total,
  COUNT(CASE WHEN status IN ('DELIVERED', 'READ') THEN 1 END) as delivered,
  ROUND(COUNT(CASE WHEN status IN ('DELIVERED', 'READ') THEN 1 END) * 100.0 / COUNT(*), 2) as success_rate
FROM proactive_messages 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY delivery_channel;
```

### Performance Views

```sql
-- Rule performance analytics
SELECT * FROM rule_performance 
ORDER BY triggered_count DESC;

-- Daily notification stats
SELECT * FROM notification_stats 
WHERE date >= CURRENT_DATE - 7;
```

### Alerts to Set Up

- ❗ Failed cron jobs (> 2 consecutive failures)
- ❗ Growing queue size (> 100 queued notifications)
- ❗ High failure rate (> 10% failed deliveries)
- ❗ Slow rule evaluation (> 60 seconds average)

## 🐛 Troubleshooting

### Common Issues

#### 1. Cron Jobs Not Running
```bash
# Check cron job status
curl -H "x-cron-secret: YOUR_SECRET" https://your-domain.com/api/cron/evaluate-rules

# Common fixes:
- Verify CRON_SECRET environment variable
- Check cron service configuration
- Validate endpoint URLs
```

#### 2. Notifications Not Being Sent
```sql
-- Check for stuck notifications
SELECT * FROM proactive_messages 
WHERE status = 'QUEUED' AND created_at < NOW() - INTERVAL '10 minutes';

-- Check user preferences
SELECT * FROM notification_preferences 
WHERE user_id = 'user-id' AND enabled = true;
```

#### 3. High Memory Usage
```bash
# Reduce batch size in environment
RULE_EVALUATION_BATCH_SIZE=25

# Monitor with smaller batches
# Check for memory leaks in sensor data fetching
```

#### 4. Slow Performance
- Optimize sensor data caching with Redis
- Add database indexes for large tables
- Consider read replicas for heavy queries
- Monitor rule complexity and evaluation time

### Debug Tools

```bash
# Manual cron trigger (development)
curl -X POST -H "x-cron-secret: YOUR_SECRET" \
  http://localhost:3000/api/cron/evaluate-rules

# Test notification
curl -X POST -H "Content-Type: application/json" \
  -d '{"auraId":"aura-id","channel":"IN_APP","message":"test"}' \
  http://localhost:3000/api/notifications/test
```

### Logging

The system logs important events:
- 🔄 Rule evaluation cycles
- 📩 Notification queue processing  
- ✅ Successful deliveries
- ❌ Failed deliveries with error details
- ⚠️ Rate limiting and quiet hours blocks

Check your application logs for these patterns to diagnose issues.

## 📝 Development Notes

### Code Organization

```
apps/web/
├── app/api/
│   ├── notifications/          # Notification management APIs
│   └── cron/                   # Background job endpoints
├── components/notifications/    # React components
├── hooks/                      # Custom React hooks
├── lib/services/
│   ├── workers/               # Background workers
│   ├── channels/              # Delivery channel implementations
│   └── notification-service.ts
└── types/notifications.ts      # TypeScript definitions
```

### Key Design Decisions

1. **Batch Processing**: Rules are evaluated in batches to prevent overwhelming the system
2. **Queue-based Delivery**: Notifications are queued and processed separately from evaluation
3. **Tier-based Scaling**: Different limits based on subscription to manage costs
4. **Real-time Updates**: Uses Supabase Realtime for instant UI updates
5. **Graceful Degradation**: System continues working if external services fail

### Future Enhancements

- 🔄 Implement remaining delivery channels (SMS, WhatsApp, Email)
- 📊 Advanced analytics and reporting dashboard
- 🤖 AI-powered notification optimization
- 📱 Mobile app push notifications
- 🔀 A/B testing for notification content
- 📈 Predictive delivery timing
- 🌐 Multi-language notification support

## 🤝 Contributing

When contributing to the notifications system:

1. **Test thoroughly** with different subscription tiers
2. **Monitor performance** impact of changes
3. **Update documentation** for any API changes  
4. **Follow security best practices** for user data
5. **Consider scalability** implications

## 📞 Support

For issues related to the proactive notifications system:

1. Check the [troubleshooting section](#troubleshooting)
2. Review application logs for error patterns
3. Verify cron job configuration and credentials
4. Test with the `/api/notifications/test` endpoint
5. Monitor the `background_jobs` table for failures

---

*The Proactive Notifications system transforms auras from reactive chatbots into proactive companions that truly understand and respond to users' lives in real-time.* 🌟