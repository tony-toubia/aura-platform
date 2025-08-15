# 🔔 Notification Automation Setup Guide

## 🎯 Current Status
- ✅ **Test Notifications**: Working (database insertion)
- ✅ **Notification Processor**: Created 
- ⏳ **Pending**: Your test notification needs processing
- ⏳ **Automation**: Needs Cloud Scheduler setup

## 🚀 Quick Start (Fix Your Pending Notification)

### Step 1: Deploy Latest Changes
The new processor endpoint needs to be deployed:
```bash
# Your deployment command here
pnpm build && deploy
```

### Step 2: Process Your Pending Notification
1. **Go to senses-diagnostics page**
2. **Click Notifications tab** 
3. **Click the new "Process Pending" button** (green button)
4. **Check your "Gh" aura conversation** - the test message should appear!

### Step 3: Set Up Automation (Optional but Recommended)

#### Option A: Automated Setup (Recommended)
```powershell
# Run the setup script
.\setup-notification-automation.ps1 -AppUrl "https://app.aura-link.app"
```

#### Option B: Manual Setup
1. **Set CRON_SECRET** environment variable:
   ```bash
   CRON_SECRET=your_secure_random_string_here
   ```

2. **Create Cloud Scheduler Jobs**:
   ```bash
   # Process notifications every minute
   gcloud scheduler jobs create http process-notifications \
     --location=us-central1 \
     --schedule="*/1 * * * *" \
     --uri="https://app.aura-link.app/api/notifications/webhook" \
     --http-method=POST \
     --headers="Content-Type=application/json,x-cron-secret=YOUR_CRON_SECRET" \
     --message-body='{"task": "process-notifications"}'
   ```

## 🧪 Testing Your Setup

### Test 1: Manual Processing (Do this first!)
1. Send test notification (creates pending record)
2. Click "Process Pending" button  
3. Check aura conversation - message should appear!

### Test 2: Webhook Testing
```bash
curl -X POST https://app.aura-link.app/api/notifications/webhook \
  -H "x-cron-secret: YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"task": "process-notifications"}'
```

### Test 3: End-to-End Automation
1. Send test notification
2. Wait 1 minute (for automated processing)  
3. Check aura conversation
4. Message should appear automatically!

## 📋 What Each Component Does

### `/api/notifications/process-pending`
- ✅ Takes "pending" notifications from database
- ✅ Creates actual conversation messages  
- ✅ Updates notification status to "delivered"
- ✅ Makes notifications visible in UI

### `/api/notifications/webhook` 
- ✅ Secured endpoint for Cloud Scheduler
- ✅ Calls the processor automatically
- ✅ Runs every minute via cron job

### `setup-notification-automation.ps1`
- ✅ Creates Cloud Scheduler jobs
- ✅ Generates secure CRON_SECRET
- ✅ Configures automation

## 🎉 Expected Results

After setup, your system will:
- ✅ **Process notifications every minute**
- ✅ **Show test messages in conversations**
- ✅ **Handle future rule-based notifications**
- ✅ **Scale automatically**

## 🔧 Troubleshooting

### Pending Notification Not Showing?
1. Check database: `SELECT * FROM proactive_messages WHERE status = 'pending'`
2. Click "Process Pending" button
3. Check console for errors
4. Verify conversation exists for the aura

### Automation Not Working?
1. Verify CRON_SECRET is set correctly
2. Check Cloud Scheduler jobs are created: `gcloud scheduler jobs list`
3. Test webhook endpoint manually
4. Check application logs

### Message Not in Conversation?
1. Verify notification status changed to "delivered"
2. Check messages table: `SELECT * FROM messages WHERE metadata->>'type' = 'proactive_notification'`
3. Hard refresh the conversation page

## 🚀 Next Steps

1. **Fix pending notification**: Deploy + click "Process Pending"
2. **Set up automation**: Run setup script
3. **Create notification rules**: Define when to send proactive messages
4. **Test sensor triggers**: Connect with fitness data, weather, etc.

Your notification system is almost complete! 🎯