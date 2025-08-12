# Redis Setup Guide for Aura Platform

## Google Cloud Memorystore Configuration

Your Redis instance is configured with:
- **Instance Name**: `aura-platform`
- **Project**: `aura-platform-production`
- **Region**: `us-central1`

## Quick Setup

### 1. Get Your Redis Instance Details

Run this command to get your Redis host and port:

```bash
gcloud redis instances describe aura-platform \
  --region=us-central1 \
  --project=aura-platform-production \
  --format="get(host,port)"
```

### 2. Store Credentials in Secret Manager

Run the setup script to automatically configure everything:

```bash
cd apps/web
npm run setup:redis
```

This will:
- ✅ Detect your existing `aura-platform` instance
- ✅ Store the Redis host/port in Secret Manager
- ✅ Set up VPC connector for Cloud Run
- ✅ Configure IAM permissions

### 3. Update Cloud Run Service

After running the setup script, update your Cloud Run service:

```bash
# Replace YOUR_SERVICE_NAME with your actual service name
gcloud run services update YOUR_SERVICE_NAME \
  --vpc-connector=redis-connector \
  --set-env-vars="GCP_PROJECT_ID=aura-platform-production" \
  --region=us-central1
```

### 4. Local Development Setup

For local development, you have two options:

#### Option A: Use Local Redis (Recommended for Development)

1. Install Redis locally:
   ```bash
   # macOS
   brew install redis
   brew services start redis
   
   # Windows (WSL)
   sudo apt update
   sudo apt install redis-server
   sudo service redis-server start
   ```

2. Add to `.env.local`:
   ```env
   REDIS_URL=redis://localhost:6379
   ```

#### Option B: Connect to Memorystore via Cloud SQL Proxy

1. Install Cloud SQL Proxy:
   ```bash
   gcloud components install cloud-sql-proxy
   ```

2. Create SSH tunnel to access Memorystore:
   ```bash
   gcloud compute ssh YOUR_VM_INSTANCE \
     --zone=us-central1-a \
     -- -N -L 6379:REDIS_HOST:6379
   ```

3. Add to `.env.local`:
   ```env
   REDIS_URL=redis://localhost:6379
   ```

### 5. Test Your Connection

```bash
npm run test:redis
```

You should see:
```
✅ Redis connection successful!
✅ Cache set/get working correctly!
✅ All Redis tests passed successfully!
```

## Environment Variables

### Production (Automatic via Secret Manager)
The application automatically fetches from Secret Manager:
- `redis-host` - Your Memorystore IP
- `redis-port` - Redis port (default: 6379)
- `redis-auth` - Optional auth string

### Development (.env.local)
```env
# For local Redis
REDIS_URL=redis://localhost:6379

# OR specify host/port separately
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Monitoring

### Check Cache Statistics
Visit `/api/cache/stats` in your deployed application to see:
- Cache hit/miss rates
- Memory usage
- Performance metrics
- Key patterns

### GCP Console Monitoring
1. Go to [Memorystore Console](https://console.cloud.google.com/memorystore/redis/instances)
2. Select `aura-platform` instance
3. View metrics:
   - Memory usage
   - Operations per second
   - Network throughput
   - CPU utilization

## Troubleshooting

### Connection Refused
- Ensure VPC connector is attached to Cloud Run service
- Verify Redis instance is in the same region
- Check firewall rules allow connection

### High Latency
- Ensure Cloud Run and Redis are in the same region
- Consider upgrading to STANDARD_HA tier for better performance
- Review cache key patterns for optimization

### Memory Issues
- Monitor memory usage in GCP Console
- Adjust TTL values in `CacheTTL` configuration
- Consider scaling up Redis instance size

## Cache Configuration

Current TTL settings (in seconds):
- Weather data: 600 (10 minutes)
- News data: 900 (15 minutes)
- User subscriptions: 300 (5 minutes)
- Aura data: 600 (10 minutes)
- OAuth connections: 600 (10 minutes)
- AI responses: 3600 (1 hour)

To adjust, modify `apps/web/lib/redis/cache-utils.ts`:

```typescript
export const CacheTTL = {
  WEATHER: 600,           // Adjust as needed
  NEWS: 900,              
  USER_SUBSCRIPTION: 300,
  // ...
}
```

## Cost Optimization

Your `aura-platform` instance (BASIC tier, 1GB) costs approximately:
- **$35/month** for BASIC tier
- **$70/month** for STANDARD_HA (high availability)

To optimize costs:
1. Monitor actual memory usage
2. Adjust instance size if underutilized
3. Use appropriate TTLs to balance performance/cost
4. Consider reserved capacity for discounts

## Support

For issues:
1. Check logs: `gcloud logging read "resource.type=redis_instance"`
2. Review this guide
3. Run `npm run test:redis` for diagnostics
4. Contact GCP support for infrastructure issues