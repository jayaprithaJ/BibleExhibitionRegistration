# QR Code Check-in System Guide

## Overview

The Bible Exhibition Registration system now includes a secure QR code-based check-in system. Each registration generates a unique, secure QR code that can be used for:

1. **Authorized Check-in**: Your mobile app can scan and mark registrations as checked-in
2. **Public View**: Anyone can scan to view slot details (read-only)

## How It Works

### 1. Registration Process

When a user completes registration:
- A unique `qr_token` (64-character secure hash) is generated
- The QR code is displayed on the confirmation page
- The QR code contains a URL: `https://your-domain.com/api/qr/{token}`

### 2. QR Code Scanning Scenarios

#### Scenario A: Scanning with Your Mobile App (Authorized Check-in)

**Endpoint**: `POST /api/checkin`

**Request Body**:
```json
{
  "token": "the-64-char-qr-token-from-scan",
  "adminKey": "your-admin-password"
}
```

**Response (Success - First Check-in)**:
```json
{
  "success": true,
  "alreadyCheckedIn": false,
  "registration": {
    "registrationNumber": "BE-ABC123",
    "name": "John Doe",
    "churchName": "St. Mary's Church",
    "totalPeople": 15,
    "checkedInAt": "2026-06-05T09:30:00Z"
  },
  "message": "Check-in successful"
}
```

**Response (Already Checked In)**:
```json
{
  "success": true,
  "alreadyCheckedIn": true,
  "registration": {
    "registrationNumber": "BE-ABC123",
    "name": "John Doe",
    "churchName": "St. Mary's Church",
    "totalPeople": 15,
    "checkedInAt": "2026-06-05T09:25:00Z"
  },
  "message": "Already checked in"
}
```

**Response (Unauthorized)**:
```json
{
  "success": false,
  "error": "Unauthorized: Invalid admin key"
}
```

#### Scenario B: Scanning with Any QR Reader (Public View)

When someone scans the QR code with a regular QR reader:
- They are redirected to: `https://your-domain.com/qr/{token}`
- This page displays:
  - Registration details (name, church, people count)
  - Assigned time slots
  - Check-in status (checked in or pending)
  - Instructions for the exhibition

**This is READ-ONLY** - no check-in capability without the admin key.

## API Endpoints

### 1. Check-in Endpoint (Authorized Only)

**POST** `/api/checkin`

**Authentication**: Requires `ADMIN_PASSWORD` in request body

**Purpose**: Mark a registration as checked-in

**Request**:
```json
{
  "token": "64-character-qr-token",
  "adminKey": "your-admin-password"
}
```

**Use Case**: Your mobile app scans the QR code, extracts the token, and calls this endpoint with your admin key.

### 2. Public View Endpoint (Read-Only)

**GET** `/api/qr/{token}`

**Authentication**: None required

**Purpose**: Retrieve registration details for display

**Response**:
```json
{
  "success": true,
  "registration": {
    "registration_number": "BE-ABC123",
    "name": "John Doe",
    "church_name": "St. Mary's Church",
    "total_people": 15,
    "tamil_count": 10,
    "english_count": 5,
    "checked_in": false,
    "checked_in_at": null,
    "slots": [
      {
        "language": "tamil",
        "slot_date": "2026-06-05",
        "slot_time": "09:00:00",
        "people_count": 10,
        "group_sequence": 1
      },
      {
        "language": "english",
        "slot_date": "2026-06-05",
        "slot_time": "09:20:00",
        "people_count": 5,
        "group_sequence": 2
      }
    ]
  }
}
```

## Database Schema Changes

New fields added to `registrations` table:

```sql
qr_token VARCHAR(64) UNIQUE NOT NULL,
checked_in BOOLEAN DEFAULT false,
checked_in_at TIMESTAMP WITH TIME ZONE,
checked_in_by VARCHAR(255)
```

## Security Features

1. **Unique Tokens**: Each registration gets a cryptographically secure 64-character token
2. **Admin Key Protection**: Check-in requires the admin password
3. **One-Time Check-in**: Once checked in, the status is permanent (prevents duplicate check-ins)
4. **Public Read-Only**: Anyone can view details but cannot modify check-in status

## Mobile App Integration

### Step 1: Scan QR Code

Your mobile app should:
1. Use a QR code scanner library
2. Extract the URL from the QR code
3. Parse the token from the URL (last segment after `/api/qr/`)

Example URL: `http://localhost:3002/api/qr/a1b2c3d4e5f6...`
Token: `a1b2c3d4e5f6...`

### Step 2: Call Check-in API

```javascript
// Example mobile app code
async function checkInRegistration(token) {
  const response = await fetch('http://localhost:3002/api/checkin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: token,
      adminKey: 'your-admin-password', // Store securely in your app
    }),
  });

  const data = await response.json();
  
  if (data.success) {
    if (data.alreadyCheckedIn) {
      // Show "Already checked in" message
      alert(`Already checked in at ${data.registration.checkedInAt}`);
    } else {
      // Show success message
      alert(`Check-in successful for ${data.registration.name}`);
    }
  } else {
    // Show error
    alert(`Error: ${data.error}`);
  }
}
```

### Step 3: Handle Responses

Your app should handle:
- ✅ Successful check-in
- ⚠️ Already checked in
- ❌ Invalid QR code
- ❌ Unauthorized (wrong admin key)
- ❌ Network errors

## Configuration

### Environment Variables

Update your `.env.local` file:

```env
# App runs on port 3002 to avoid conflicts
NEXT_PUBLIC_APP_URL=http://localhost:3002

# Admin password used for check-in authorization
ADMIN_PASSWORD=your-secure-password-here
```

### Running the Application

```bash
# Development (runs on port 3002)
npm run dev

# Production
npm run build
npm start
```

## Testing the System

### Test 1: Create a Registration

1. Go to `http://localhost:3002/register`
2. Fill in the form and submit
3. Note the QR code on the confirmation page

### Test 2: Public View (Any QR Reader)

1. Scan the QR code with your phone's camera
2. You should see the registration details page
3. Verify it shows "Pending Check-in"

### Test 3: Check-in (Your Mobile App)

1. Extract the token from the QR code URL
2. Call the check-in API with your admin key
3. Verify the response shows success
4. Scan again - should show "Already checked in"

### Test 4: Invalid Token

1. Try calling the API with a fake token
2. Should return 404 "Invalid QR code"

### Test 5: Wrong Admin Key

1. Call check-in API with wrong admin key
2. Should return 401 "Unauthorized"

## Troubleshooting

### Issue: QR code shows localhost URL

**Solution**: Update `NEXT_PUBLIC_APP_URL` in `.env.local` to your production domain before deployment.

### Issue: Check-in fails with "Unauthorized"

**Solution**: Verify the `adminKey` in your mobile app matches `ADMIN_PASSWORD` in `.env.local`.

### Issue: "Already checked in" but shouldn't be

**Solution**: Check the database `registrations` table. You can manually reset:
```sql
UPDATE registrations 
SET checked_in = false, checked_in_at = NULL, checked_in_by = NULL 
WHERE registration_number = 'BE-ABC123';
```

### Issue: Port 3002 already in use

**Solution**: Change the port in `package.json`:
```json
"dev": "next dev -p 3003"
```

## Production Deployment

Before deploying to production:

1. ✅ Update `NEXT_PUBLIC_APP_URL` to your production domain
2. ✅ Set a strong `ADMIN_PASSWORD`
3. ✅ Run database migrations to add new fields
4. ✅ Test the check-in flow end-to-end
5. ✅ Secure your admin key in your mobile app (use environment variables or secure storage)

## Database Migration

If you have existing registrations, run this migration:

```sql
-- Add new columns
ALTER TABLE registrations 
ADD COLUMN qr_token VARCHAR(64) UNIQUE,
ADD COLUMN checked_in BOOLEAN DEFAULT false,
ADD COLUMN checked_in_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN checked_in_by VARCHAR(255);

-- Generate tokens for existing registrations
UPDATE registrations 
SET qr_token = md5(random()::text || clock_timestamp()::text)::text || md5(random()::text || clock_timestamp()::text)::text
WHERE qr_token IS NULL;

-- Make qr_token NOT NULL after populating
ALTER TABLE registrations ALTER COLUMN qr_token SET NOT NULL;

-- Add indexes
CREATE INDEX idx_registrations_qr_token ON registrations(qr_token);
CREATE INDEX idx_registrations_checked_in ON registrations(checked_in);
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API endpoint documentation
3. Verify your environment variables are correct
4. Check the browser console and server logs for errors