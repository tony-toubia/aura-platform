# 🕐 Time-Based Rules in Aura Platform

## **🎉 New Feature: Always Available Time Triggers**

You can now create rules based on time without configuring any physical sensors! Time-based triggers are always available in the rule builder and perfect for proactive notifications.

## **🛠️ How to Access**

### **In Rule Builder:**
1. Go to any aura's page
2. Click **"Configure Rules"** or navigate to `/auras/[id]/rules`
3. Create a new rule
4. In the **sensor selector**, you'll now see a **"Digital"** category
5. **Time sensors are always available** - no sensor configuration required!

### **Available Time Sensors:**

#### **⏰ Specific Time Options**
- **`Current Hour`** - Trigger at specific hours (0-23, 24h format)
- **`Current Minute`** - Trigger at specific minutes (0-59)
- **`Specific Time`** - Set exact time triggers (e.g., 9:00 AM)

#### **📅 Day & Schedule Options**
- **`Day of Week`** - Monday, Tuesday, Wednesday, etc.
- **`Workday vs Weekend`** - Weekday (Mon-Fri) or Weekend (Sat-Sun)

#### **🌅 Time of Day Options**
- **`Time of Day`** - Early Morning, Morning, Afternoon, Evening, Night, Late Night

## **🎯 Ready-Made Templates**

The rule builder now includes **time-based templates** you can use instantly:

### **Daily Routines**
- ✅ **Morning Motivation** - Energizing start to the day
- ✅ **Workday Start Reminder** - 9 AM productivity focus
- ✅ **Afternoon Energy Check** - 2 PM pick-me-up
- ✅ **Evening Check-in** - Reflection and wind-down
- ✅ **Bedtime Wind-down** - Sleep routine reminder

### **Weekly Patterns**
- ✅ **Friday Celebration** - End-of-week appreciation
- ✅ **Weekend Relaxation** - Self-care and fun reminders

## **💡 Example Use Cases**

### **Morning Check-in** (Weekdays at 9 AM)
```
Sensor: Current Hour
Condition: equals 9
Days: Monday-Friday
Message: "Good morning! ☀️ Ready to tackle today's goals?"
```

### **Evening Reflection** (Daily at 7 PM)
```
Sensor: Time of Day
Condition: equals Evening
Message: "How was your day? 🌅 Take a moment to appreciate what went well!"
```

### **Weekend Reminder** (Saturdays & Sundays)
```
Sensor: Workday vs Weekend
Condition: equals Weekend
Message: "It's the weekend! 🎉 Time to recharge and do something you love."
```

### **Specific Time Trigger** (Daily at 2:30 PM)
```
Sensor: Specific Time
Condition: equals 14:30
Message: "Mid-afternoon energy dip? 🔋 How about a quick walk?"
```

## **🔧 How It Works**

### **Always Available**
- ✅ **No sensor configuration required** - Time sensors work out-of-the-box
- ✅ **Available on all subscription tiers** - Even Free plan users can use time triggers
- ✅ **No physical devices needed** - Uses system time and calendar data

### **Smart Integration**
- ✅ **Works with proactive notifications** - Perfect for morning reminders, evening check-ins
- ✅ **Cooldown prevention** - Prevents spam (default 5-minute cooldown)
- ✅ **Priority system** - Control importance levels (1-10)
- ✅ **Smart responses** - AI can provide personalized time-based responses

### **Flexible Conditions**
- ✅ **Multiple operators**: equals, greater than, less than, between
- ✅ **Combination rules**: Mix time with other sensors (weather + morning = perfect!)
- ✅ **Custom timing**: Create precise scheduling that fits your routine

## **🚀 Getting Started**

### **Quick Start - Morning Motivation Rule:**
1. Go to rule builder
2. Select **"Morning Motivation"** template
3. Customize message if desired
4. Save rule
5. ✨ **Done!** You'll get morning motivation messages

### **Custom Time Rule:**
1. Select **"Current Hour"** sensor
2. Choose **"equals"** operator  
3. Set value to **"9"** (for 9 AM)
4. Add your custom message
5. Set priority and cooldowns
6. Save and test!

## **⚡ Integration with Proactive Notifications**

Time-based rules work perfectly with the proactive notification system:

- **Automatic evaluation** every 5 minutes
- **Smart delivery** - Won't spam you with duplicate messages
- **Multiple channels** - In-app, web push, SMS (based on subscription)
- **Conversation integration** - Messages appear naturally in aura chats

## **🎨 Best Practices**

### **Meaningful Scheduling**
- ✅ **Morning routines**: 8-10 AM motivation and goal-setting
- ✅ **Workday transitions**: 9 AM start, 12 PM lunch, 5 PM wrap-up
- ✅ **Evening wind-down**: 7-9 PM reflection and relaxation
- ✅ **Weekend differentiation**: Different messages for weekends vs weekdays

### **Avoid Over-Notification**
- ✅ **Use cooldowns** - Prevent multiple messages in short periods
- ✅ **Vary timing** - Don't trigger everything at the same time
- ✅ **Priority levels** - Use lower priority (3-4) for routine reminders
- ✅ **Test gradually** - Start with one rule, add more as needed

### **Personalization**
- ✅ **Custom messages** - Make them relevant to your routine
- ✅ **Smart responses** - Let AI provide contextual, personalized responses
- ✅ **Tone matching** - Choose tones that fit the time (energetic morning, calm evening)

## **📊 Time Categories Explained**

### **Early Morning (5-8 AM)**
- Perfect for: Wake-up routines, meditation, morning preparation

### **Morning (8-12 PM)** 
- Perfect for: Work start, goal-setting, productivity focus

### **Afternoon (12-5 PM)**
- Perfect for: Lunch reminders, energy checks, progress updates

### **Evening (5-9 PM)**
- Perfect for: Reflection, family time, relaxation prep

### **Night (9 PM-12 AM)**
- Perfect for: Wind-down routines, gratitude, sleep preparation

### **Late Night (12-5 AM)**
- Perfect for: Gentle reminders for late workers, night shift support

## **🔮 Coming Soon**

- **Calendar integration** - Rules based on upcoming meetings
- **Seasonal time adjustments** - Different schedules for seasons
- **Location-aware timing** - Adjust for time zones
- **Habit tracking integration** - Time-based habit formation

---

## **🎯 Summary**

Time-based rules transform your auras from reactive assistants into proactive companions that:
- ✅ **Check in at meaningful moments** throughout your day
- ✅ **Provide routine structure** with personalized reminders  
- ✅ **Support healthy habits** with gentle, timed encouragements
- ✅ **Adapt to your schedule** with weekday/weekend awareness

**Start building your time-based rules today and experience truly proactive AI companionship!** 🌟