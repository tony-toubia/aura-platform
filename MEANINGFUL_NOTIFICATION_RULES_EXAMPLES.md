# 🎯 Meaningful Notification Rules - Examples

## 🚫 **What NOT to Do**
- ❌ **Constant spam**: Every 5-15 minutes 
- ❌ **Generic time-based**: Every hour/day without context
- ❌ **Annoying reminders**: Too frequent check-ins
- ❌ **Meaningless content**: "Test message" or generic alerts

## ✅ **Smart, Contextual Rules**

### **📅 Time-Based Rules (Thoughtful)**

#### **1. Morning Motivation (Weekdays Only)**
```sql
INSERT INTO notification_rules (aura_id, rule_name, trigger_type, conditions, message_template, priority, cooldown_minutes) VALUES 
('your-aura-id', 'Morning Motivation', 'scheduled', 
'{"schedule": "0 9 * * 1-5", "timeOfDay": "morning"}'::jsonb,
'Good morning! ☀️ Ready to make today amazing? What\'s one thing you\'re excited about today?', 4, 1440);
```

#### **2. Evening Reflection (Sunday Evenings)**
```sql
INSERT INTO notification_rules (aura_id, rule_name, trigger_type, conditions, message_template, priority, cooldown_minutes) VALUES 
('your-aura-id', 'Weekly Reflection', 'scheduled',
'{"schedule": "0 19 * * 0", "timeOfDay": "evening"}'::jsonb,
'Sunday evening reflection time 🌅 What was your biggest win this week?', 5, 10080);
```

#### **3. Lunch Break Reminder (Work Hours)**
```sql
INSERT INTO notification_rules (aura_id, rule_name, trigger_type, conditions, message_template, priority, cooldown_minutes) VALUES 
('your-aura-id', 'Lunch Break', 'scheduled',
'{"schedule": "0 12 * * 1-5", "timeOfDay": "afternoon"}'::jsonb,
'Time for a proper lunch break! 🍽️ Step away from work and nourish yourself.', 3, 1440);
```

### **🌤️ Weather-Based Rules**

#### **4. Rainy Day Comfort**
```sql
INSERT INTO notification_rules (aura_id, rule_name, trigger_type, conditions, message_template, priority, cooldown_minutes) VALUES 
('your-aura-id', 'Rainy Day Vibes', 'weather_condition',
'{"precipitation": true, "temperature": {"min": 10, "max": 25}}'::jsonb,
'Perfect rainy day weather! ☔ Great time for cozy indoor activities or dancing in the rain! 💃', 6, 480);
```

#### **5. Beautiful Weather Alert**
```sql
INSERT INTO notification_rules (aura_id, rule_name, trigger_type, conditions, message_template, priority, cooldown_minutes) VALUES 
('your-aura-id', 'Perfect Weather', 'weather_condition',
'{"temperature": {"min": 20, "max": 25}, "precipitation": false, "windSpeed": {"max": 15}}'::jsonb,
'Absolutely perfect weather outside! 🌞 Temperature is {{weather.temperature}}°C - ideal for a walk or outdoor time!', 7, 360);
```

### **📱 Activity-Based Rules**

#### **6. Long Work Session Break**
```sql
INSERT INTO notification_rules (aura_id, rule_name, trigger_type, conditions, message_template, priority, cooldown_minutes) VALUES 
('your-aura-id', 'Take a Break', 'user_activity',
'{"inactive_hours": 3, "timeOfDay": ["morning", "afternoon"]}'::jsonb,
'You\'ve been focused for a while! 🧘 How about a 5-minute stretch or walk? Your body will thank you.', 4, 180);
```

#### **7. Weekend Encouragement**
```sql
INSERT INTO notification_rules (aura_id, rule_name, trigger_type, conditions, message_template, priority, cooldown_minutes) VALUES 
('your-aura-id', 'Weekend Wellness', 'scheduled',
'{"schedule": "0 10 * * 6,7", "dayOfWeek": ["Saturday", "Sunday"]}'::jsonb,
'Weekend mode activated! 🎉 What brings you joy today? Time to recharge and do something you love.', 4, 1440);
```

### **🔗 Contextual Rules**

#### **8. Travel Day Support**
```sql
INSERT INTO notification_rules (aura_id, rule_name, trigger_type, conditions, message_template, priority, cooldown_minutes) VALUES 
('your-aura-id', 'Travel Companion', 'sensor_trigger',
'{"location_change": true, "distance_km": {"min": 50}}'::jsonb,
'Looks like you\'re on the move! 🚗✈️ Safe travels! Need any travel tips or just want to chat during the journey?', 6, 720);
```

#### **9. Seasonal Awareness**
```sql
INSERT INTO notification_rules (aura_id, rule_name, trigger_type, conditions, message_template, priority, cooldown_minutes) VALUES 
('your-aura-id', 'Season Change', 'scheduled',
'{"schedule": "0 9 21 3,6,9,12 *", "seasonal": true}'::jsonb,
'First day of {{season}}! 🍃🌸☀️❄️ How does the changing season make you feel? Any new goals or activities calling to you?', 7, 43200);
```

## 🎯 **Smart Rule Principles**

### **✅ Good Rule Characteristics:**
1. **Meaningful timing** - When users actually want to hear from you
2. **Contextual relevance** - Based on real conditions (weather, activity, etc.)  
3. **Reasonable frequency** - Respects user's time and attention
4. **Personal value** - Provides encouragement, reminders, or useful information
5. **Appropriate cooldowns** - Prevents spam even if conditions repeat

### **⏰ Recommended Cooldowns:**
- **Daily messages**: 1440 minutes (24 hours)
- **Weather alerts**: 360-480 minutes (6-8 hours)  
- **Activity reminders**: 180-240 minutes (3-4 hours)
- **Weekly messages**: 10080 minutes (7 days)
- **Seasonal/Special**: 43200 minutes (30 days)

### **🔄 Rule Evaluation Frequency by Tier:**
- **Free**: Every 30 minutes (max 10 notifications/day)
- **Personal**: Every 15 minutes (max 50 notifications/day)  
- **Family**: Every 5 minutes (max 200 notifications/day)
- **Business**: Every 1 minute (unlimited notifications)

## 🧪 **Testing Strategy**

### **For Development:**
```sql
-- Temporary test rule (disable after testing)
INSERT INTO notification_rules (aura_id, rule_name, trigger_type, conditions, message_template, priority, enabled, cooldown_minutes) VALUES 
('your-aura-id', 'DEV TEST - Delete Me', 'scheduled',
'{"schedule": "*/5 * * * *"}'::jsonb,  -- Every 5 minutes
'🧪 TEST: Rule system working at {{time}}', 2, true, 0);
```

**Remember to DELETE or DISABLE test rules after verification!**

### **Quick Test Commands:**
```sql
-- Disable all test rules
UPDATE notification_rules SET enabled = false WHERE rule_name LIKE '%TEST%' OR rule_name LIKE '%test%';

-- Delete test rules  
DELETE FROM notification_rules WHERE rule_name LIKE '%TEST%' OR rule_name LIKE '%test%';

-- Check active rules
SELECT rule_name, trigger_type, conditions, enabled FROM notification_rules WHERE enabled = true;
```

## 🎉 **Result: Delightful User Experience**

With thoughtful rules, your auras become:
- **Helpful companions** that reach out at the right moments
- **Contextually aware** assistants that respond to real conditions  
- **Respectful of boundaries** with appropriate timing and frequency
- **Genuinely valuable** sources of encouragement and reminders

**No more notification fatigue - just meaningful moments of connection!** ✨