# Where to Find Your Application (Client) ID in Azure

## Quick Answer
The **Application (client) ID** is located on the **Overview** page of your Azure App Registration.

## Step-by-Step Instructions

### 1. Navigate to Your App Registration
- Go to [Azure Portal](https://portal.azure.com)
- Search for "App registrations" 
- Click on your app: "Aura Platform Calendar Integration"

### 2. Find the Application (Client) ID
Once you're on your app registration page:

1. You should be on the **"Overview"** tab by default
2. Look for the section called **"Essentials"** 
3. You'll see a field labeled **"Application (client) ID"**
4. It looks like this: `12345678-1234-1234-1234-123456789abc`
5. Click the **copy icon** next to it to copy the value

## Visual Location
```
Azure App Registration > Overview Page
┌─────────────────────────────────────────┐
│ Essentials                              │
├─────────────────────────────────────────┤
│ Application (client) ID                 │
│ 12345678-1234-1234-1234-123456789abc   │ ← This is what you need!
│                                         │
│ Object ID                               │
│ abcdef12-3456-7890-abcd-ef1234567890   │
│                                         │
│ Directory (tenant) ID                   │
│ 98765432-1098-7654-3210-987654321098   │
└─────────────────────────────────────────┘
```

## What It Looks Like
- **Format**: A GUID (Globally Unique Identifier)
- **Length**: 36 characters including dashes
- **Example**: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

## Where to Use It
Copy this value and paste it into your `.env.local` file:

```bash
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

## If You Can't Find It
If you don't see the Overview page or the Application (client) ID:

1. **Make sure you're in the right place**: You should be in "App registrations", not "Enterprise applications"
2. **Click on your app name**: Make sure you've clicked on "Aura Platform Calendar Integration" to open it
3. **Check the left sidebar**: Click on "Overview" in the left navigation menu
4. **Refresh the page**: Sometimes Azure takes a moment to load

## Still Need Help?
The Application (client) ID is always on the Overview page of any Azure App Registration. If you're still having trouble:

1. Make sure you completed the app registration process
2. Try refreshing the Azure portal page
3. Double-check you're looking at the right app registration

This ID is safe to use in your frontend code (that's why it starts with `NEXT_PUBLIC_`) - it's meant to be public, unlike the client secret which must be kept private.