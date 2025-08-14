# Senses Diagnostics System

## Overview

The **Senses Diagnostics Page** is a comprehensive debugging and monitoring tool that helps you troubleshoot sensor data, OAuth connections, and the proactive notification system in your Aura Platform.

## Access

- **URL**: `/senses-diagnostics`
- **Navigation**: User Avatar Menu → "Senses Diagnostics"
- **Access Level**: Authenticated users only

## Features

### 📊 System Status Dashboard
- **Active Senses**: Shows how many senses are operational vs total configured
- **Active Rules**: Displays rule status and evaluation counts
- **Notifications Today**: Real-time count of notifications sent
- **Last Cron Run**: Timestamp of latest background process execution

### 🔍 Sensor Data Tab
Real-time sensor data inspection with:
- **Live Data Testing**: Test fetch sensor data on-demand
- **Connection Status**: See OAuth connection status for connected senses
- **Configuration Display**: View location configs, news settings, weather settings
- **Error Detection**: Identify sensors with issues and error messages
- **Last Update Timestamps**: Track when data was last refreshed

### 🔌 Connections Tab
OAuth connection monitoring:
- **Provider Status**: Google, Fitbit, Microsoft, Strava connections
- **Connection Health**: Active/inactive status indicators
- **Account Details**: Connected account information
- **Connection History**: When connections were established

### 🔔 Notifications Tab  
Notification system debugging:
- **Recent Notifications**: Last 50 notifications with delivery status
- **Test Notifications**: Send test notifications to verify system
- **Delivery Status**: Success/Failed/Queued status tracking
- **Error Messages**: Debug failed notification attempts

### ⚙️ System Tab
System health monitoring:
- **Database Status**: Aura counts, rule counts, system metrics
- **Background Jobs**: Cron job execution status
- **Performance Metrics**: Rule evaluation and processing times

### 🛠️ Tools Tab
Utility functions:
- **Export Reports**: Download diagnostic data as JSON
- **Copy Reports**: Copy diagnostic summary to clipboard  
- **API Testing**: Quick access to debug endpoints
- **Test Actions**: Send test notifications and trigger system checks

## Use Cases

### 🐛 Debugging Sensor Issues
1. Go to **Sensor Data** tab
2. Filter by specific aura if needed
3. Look for sensors with `error` or `warning` status
4. Click **"Test Data Fetch"** to verify real-time data retrieval
5. Check configuration and connection details

### 🔗 Troubleshooting OAuth Connections
1. Navigate to **Connections** tab
2. Verify all expected providers are listed
3. Check for inactive connections (they may need re-authorization)
4. Cross-reference with **Sensor Data** tab to ensure connected senses are working

### 📬 Notification System Issues
1. Check **Notifications** tab for recent delivery attempts
2. Look for failed notifications and error messages
3. Use **"Send Test Notification"** to verify system functionality
4. Check **System** tab to ensure background jobs are running

### 📈 Performance Monitoring
1. Monitor **System Status** cards for overall health
2. Check **Last Cron Run** to ensure background processes are active
3. Review notification counts and rule evaluation frequency
4. Export reports for historical tracking

## API Endpoints

### Primary Diagnostic Endpoint
- **GET** `/api/debug/senses-diagnostics`
- Returns comprehensive system status and sensor data

### Individual Sensor Testing
- **POST** `/api/debug/test-sense-data`
- Tests specific sensor data retrieval
- Body: `{ "senseId": "weather.temperature", "auraId": "optional" }`

### System Test Endpoint
- **GET** `/api/debug/test-diagnostics`
- Comprehensive system validation and health check
- Returns test results, recommendations, and system status

### Simple Test Endpoint
- **GET** `/api/debug/simple-test`
- Minimal test of core tables (auras, behavior_rules, proactive_messages)
- Fastest way to identify basic database issues

### Basic Test Endpoint
- **GET** `/api/debug/test-basic`
- Comprehensive authentication and database table verification
- Tests all required tables with detailed error reporting

### Debug Test Page
- **GET** `/debug/test`
- Interactive test interface for troubleshooting issues
- Run simple, basic, and full diagnostics tests with detailed error reporting

### Date Validation Test
- **GET** `/api/debug/test-dates`
- Tests date validation functions with various input types
- Useful for diagnosing "RangeError: Invalid time value" issues

### Simple Test Notification
- **POST** `/api/debug/test-simple-notification`
- Bypasses complex notification service logic
- Directly inserts test message into database
- Useful for testing notification system without external dependencies

### Existing Debug Endpoints
- **GET** `/api/debug/senses` - Raw database senses
- **GET** `/api/debug/subscription-guard` - Subscription system test

## Data Export

### Copy Diagnostic Report
Copies a summary JSON to clipboard containing:
```json
{
  "timestamp": "2025-01-13T...",
  "systemStatus": { /* system metrics */ },
  "aurasSummary": [ /* aura overview */ ],
  "sensesSummary": [ /* sensor status */ ]
}
```

### Download Full Report  
Downloads complete diagnostic data as `senses-diagnostic-YYYY-MM-DD-HH-MM.json`

## Integration with Existing Systems

### Works With
- **Proactive Notifications**: Full integration with notification system debugging
- **Rule Builder**: Sensor configurations and rule evaluation monitoring  
- **OAuth System**: Connection status and health monitoring
- **Weather Service**: Real-time weather data testing
- **Sense Selector**: Configuration validation and testing

### Complements
- **PROACTIVE_NOTIFICATIONS_IMPLEMENTATION.md**: Provides debugging for the notification system
- **Rule Builder diagnostics**: Validates sensor configurations used in rules
- **OAuth connection management**: Troubleshoots sense connections

## Quick Start & Testing

### First Time Setup Validation
1. **System Test**: Visit `/api/debug/test-diagnostics` to validate your setup
2. **Check Results**: Look for any FAIL status tests
3. **Fix Issues**: Follow the provided recommendations
4. **Access UI**: Navigate to `/senses-diagnostics` once all tests pass

### Testing Commands
```bash
# Test the diagnostics system
curl https://your-domain.com/api/debug/test-diagnostics

# Test individual sensor data
curl -X POST https://your-domain.com/api/debug/test-sense-data \
  -H "Content-Type: application/json" \
  -d '{"senseId": "weather.temperature"}'

# Check raw sensor configurations
curl https://your-domain.com/api/debug/senses
```

## Best Practices

### Regular Monitoring
- Check diagnostics after adding new auras or senses
- Monitor notification delivery rates
- Verify OAuth connections haven't expired

### Troubleshooting Workflow

#### For 500 Errors:
1. **Debug Test Page**: Visit `/debug/test` for interactive troubleshooting
2. **Simple Test**: Run the quickest test to identify core table issues
3. **Basic Test**: If simple test passes, run comprehensive table verification
4. **Check Server Logs**: Look for detailed console output with `[DIAGNOSTICS]`, `[TEST-BASIC]`, or `[SIMPLE-TEST]` prefixes
5. **Database Permissions**: Verify RLS policies and table access based on error details
6. **Full Test**: Run comprehensive diagnostics test if both simple and basic tests pass

#### For "RangeError: Invalid time value":
1. **Date Test**: Visit `/api/debug/test-dates` to check date validation
2. **Check Console**: Look for "Date formatting error" warnings in browser console
3. **Database Cleanup**: Invalid dates in database will show "Invalid Date" or "Format Error" in UI
4. **Fixed Components**: All date rendering in senses-diagnostics page now has safe fallbacks

#### For Empty Sensor Data (0 Total Senses):
1. **Check Aura Configuration**: Ensure auras have `senses` arrays populated
2. **Check Senses Table**: Verify the `senses` table has data
3. **Enhanced Logic**: Diagnostics now pulls from both aura.senses and senses table
4. **Console Logging**: Check for `[DIAGNOSTICS] Senses collected` logs showing fromAuras vs fromSensesTable counts

#### For Test Notification 500 Errors:
1. **Use Simple Test**: senses-diagnostics page now uses `/api/debug/test-simple-notification`
2. **Check Logs**: Look for `[TEST-NOTIF]` prefix in server logs
3. **Database Access**: Ensures proper insertion into `proactive_messages` table
4. **Bypass Complex Logic**: Avoids NotificationService and external dependencies

#### For UI Issues:
1. **System Test**: Run `/api/debug/test-diagnostics` first
2. **System Overview**: Check System Status dashboard
3. **Identify Issues**: Look for red/yellow status indicators  
4. **Isolate Problems**: Use aura filtering to narrow down issues
5. **Test Solutions**: Use built-in testing tools to verify fixes
6. **Export Data**: Save diagnostic reports for comparison

### Performance Optimization
- Monitor rule evaluation frequency
- Check for sensors with frequent errors
- Verify notification delivery success rates
- Track system resource usage trends

## Future Enhancements

### Planned Features
- **Rule Execution Logs**: Detailed rule triggering history
- **Performance Metrics**: Response times and throughput tracking
- **Automated Health Checks**: Scheduled diagnostic runs
- **Alert Thresholds**: Notifications when system health degrades

### Integration Opportunities  
- **Webhook Testing**: Validate external integrations
- **Data Visualization**: Graphs and trends for sensor data
- **Batch Operations**: Bulk sensor testing and configuration
- **Historical Analysis**: Long-term performance tracking

This diagnostic system provides comprehensive visibility into your Aura Platform's sensor ecosystem, making it easier to maintain, debug, and optimize your connected experiences.