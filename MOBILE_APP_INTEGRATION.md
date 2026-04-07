# Mobile App Integration Guide

## QR Code Scanning Result

When you scan the QR code, you get a URL like:
```
http://localhost:3002/api/qr/d08b9fc07b5c1d23f466998e09956a1bd82f330b80986966e01c0dcfeedbc945
```

## Step-by-Step Integration

### Step 1: Configure Network Access

Since your mobile device needs to reach your development server:

**Option A: Find Your Computer's IP Address**

On Mac/Linux:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

On Windows:
```bash
ipconfig
```

Look for something like `192.168.1.100`

**Option B: Update .env.local**

Replace `localhost` with your IP:
```env
NEXT_PUBLIC_APP_URL=http://192.168.1.100:3002
```

Then restart the server:
```bash
npm run dev
```

### Step 2: Mobile App Code

Here's the complete code for your mobile app:

```javascript
// Example: React Native or Flutter (adjust for your platform)

async function handleQRCodeScan(qrData) {
  try {
    // qrData will be: "http://192.168.1.100:3002/api/qr/d08b9fc07b5c1d23f466998e09956a1bd82f330b80986966e01c0dcfeedbc945"
    
    // Extract the token (last part of URL)
    const token = qrData.split('/').pop();
    
    // Your server URL (use IP address, not localhost)
    const serverUrl = 'http://192.168.1.100:3002';
    
    // Call check-in API
    const response = await fetch(`${serverUrl}/api/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token,
        adminKey: 'admin123'  // Store this securely in your app
      })
    });
    
    const result = await response.json();
    
    // Handle the response
    if (result.success) {
      if (result.alreadyCheckedIn) {
        // Already checked in
        showAlert(
          'Already Checked In',
          `${result.registration.name} was already checked in at ${new Date(result.registration.checkedInAt).toLocaleString()}`
        );
      } else {
        // Successfully checked in
        showAlert(
          'Check-in Successful! ✓',
          `${result.registration.name}\n${result.registration.churchName}\n${result.registration.totalPeople} people`
        );
      }
    } else {
      // Error
      showAlert('Error', result.error);
    }
    
  } catch (error) {
    console.error('Check-in error:', error);
    showAlert('Error', 'Failed to connect to server. Make sure you are on the same network.');
  }
}

// Helper function to show alerts (adjust for your platform)
function showAlert(title, message) {
  // React Native: Alert.alert(title, message)
  // Flutter: showDialog(...)
  // Web: alert(`${title}: ${message}`)
  console.log(`${title}: ${message}`);
}
```

### Step 3: Test the Integration

**Test Case 1: Successful Check-in**
1. Scan a QR code from a registration
2. Your app should show: "Check-in Successful! ✓"
3. Display: Name, Church, People count

**Test Case 2: Already Checked In**
1. Scan the same QR code again
2. Your app should show: "Already Checked In"
3. Display: When they were checked in

**Test Case 3: Invalid QR Code**
1. Scan a fake/invalid QR code
2. Your app should show: "Error: Invalid QR code"

**Test Case 4: Wrong Admin Key**
1. Use wrong adminKey in your code
2. Your app should show: "Error: Unauthorized: Invalid admin key"

## API Response Examples

### Success (First Check-in)
```json
{
  "success": true,
  "alreadyCheckedIn": false,
  "registration": {
    "registrationNumber": "BE-ABC123",
    "name": "John Doe",
    "churchName": "St. Mary's Church",
    "totalPeople": 15,
    "checkedInAt": "2026-06-05T09:30:00.000Z"
  },
  "message": "Check-in successful"
}
```

### Already Checked In
```json
{
  "success": true,
  "alreadyCheckedIn": true,
  "registration": {
    "registrationNumber": "BE-ABC123",
    "name": "John Doe",
    "churchName": "St. Mary's Church",
    "totalPeople": 15,
    "checkedInAt": "2026-06-05T09:25:00.000Z"
  },
  "message": "Already checked in"
}
```

### Invalid QR Code
```json
{
  "success": false,
  "error": "Invalid QR code"
}
```

### Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized: Invalid admin key"
}
```

## Security Best Practices

### 1. Store Admin Key Securely

**Don't do this:**
```javascript
const adminKey = 'admin123';  // ❌ Hardcoded
```

**Do this instead:**
```javascript
// React Native
import { ADMIN_KEY } from '@env';

// Or use secure storage
import * as SecureStore from 'expo-secure-store';
const adminKey = await SecureStore.getItemAsync('adminKey');
```

### 2. Validate QR Code Format

```javascript
function isValidQRCode(qrData) {
  // Check if it's a valid URL
  if (!qrData.startsWith('http')) {
    return false;
  }
  
  // Check if it contains /api/qr/
  if (!qrData.includes('/api/qr/')) {
    return false;
  }
  
  // Extract token and check length (should be 64 characters)
  const token = qrData.split('/').pop();
  if (token.length !== 64) {
    return false;
  }
  
  return true;
}
```

### 3. Handle Network Errors

```javascript
async function checkIn(token) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${serverUrl}/api/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, adminKey }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
    
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - check your network connection');
    }
    throw error;
  }
}
```

## Troubleshooting

### Issue: "Failed to connect to server"

**Solution:**
1. Make sure your mobile device is on the same WiFi network as your computer
2. Check your computer's firewall settings
3. Verify the IP address in your app matches your computer's IP
4. Test the URL in your mobile browser first: `http://192.168.1.100:3002`

### Issue: "Unauthorized: Invalid admin key"

**Solution:**
1. Check that `adminKey` in your app matches `ADMIN_PASSWORD` in `.env.local`
2. Default is `admin123`
3. Make sure there are no extra spaces or quotes

### Issue: "Invalid QR code"

**Solution:**
1. Make sure you're scanning a QR code from the confirmation page
2. Check that the database migration was run
3. Verify the token is 64 characters long

### Issue: QR code shows localhost instead of IP

**Solution:**
1. Update `NEXT_PUBLIC_APP_URL` in `.env.local` to use your IP address
2. Restart the server: `npm run dev`
3. Create a new registration to get a QR code with the correct URL

## Production Deployment

When deploying to production:

1. **Update .env.local:**
```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
ADMIN_PASSWORD=your-very-secure-password
```

2. **Update your mobile app:**
```javascript
const serverUrl = 'https://your-domain.com';
const adminKey = 'your-very-secure-password';
```

3. **Use HTTPS** for security

4. **Store admin key securely** in your mobile app (not hardcoded)

## Complete Example: React Native

```javascript
import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

const SERVER_URL = 'http://192.168.1.100:3002';
const ADMIN_KEY = 'admin123';

export default function CheckInScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(false);

  React.useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    setScanning(false);
    
    // Validate QR code
    if (!data.includes('/api/qr/')) {
      Alert.alert('Invalid QR Code', 'This is not a valid registration QR code');
      return;
    }
    
    // Extract token
    const token = data.split('/').pop();
    
    try {
      // Call check-in API
      const response = await fetch(`${SERVER_URL}/api/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, adminKey: ADMIN_KEY })
      });
      
      const result = await response.json();
      
      if (result.success) {
        if (result.alreadyCheckedIn) {
          Alert.alert(
            'Already Checked In',
            `${result.registration.name} was checked in at ${new Date(result.registration.checkedInAt).toLocaleTimeString()}`
          );
        } else {
          Alert.alert(
            'Check-in Successful! ✓',
            `${result.registration.name}\n${result.registration.churchName}\n${result.registration.totalPeople} people`
          );
        }
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Connection Error', 'Failed to connect to server. Check your network.');
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }
  
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      {scanning ? (
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={{ flex: 1 }}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Button title="Scan QR Code" onPress={() => setScanning(true)} />
        </View>
      )}
    </View>
  );
}
```

## Support

For issues:
1. Check this guide's troubleshooting section
2. Verify your network configuration
3. Test the API endpoint directly using Postman or curl
4. Check server logs for errors