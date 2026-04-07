# Mobile App Workflow - Two-Step Check-in

## Overview

Your mobile app should follow this two-step process:

### Step 1: Scan QR Code (No Admin Key Required)
- User scans QR code
- App calls **GET** `/api/qr/{token}` (no authentication)
- Shows registration details and current check-in status
- Displays "Check In" button if not already checked in

### Step 2: Check-in Action (Admin Key Required)
- User clicks "Check In" button
- App prompts for admin password
- App calls **POST** `/api/checkin` with admin key
- Marks registration as checked in

## Complete Mobile App Flow

```javascript
// STEP 1: Scan QR Code and Get Details
async function handleQRCodeScan(qrData) {
  try {
    // Extract token from QR code
    // QR contains: http://192.168.1.100:3002/api/qr/d08b9fc07b5c1d23f466998e09956a1bd82f330b80986966e01c0dcfeedbc945
    const token = qrData.split('/').pop();
    
    // Call public API to get registration details (NO ADMIN KEY NEEDED)
    const response = await fetch(`http://192.168.1.100:3002/api/qr/${token}`);
    const result = await response.json();
    
    if (result.success) {
      // Show registration details screen
      showRegistrationDetails(result.registration, token);
    } else {
      showAlert('Error', 'Invalid QR code');
    }
    
  } catch (error) {
    showAlert('Error', 'Failed to load registration details');
  }
}

// STEP 2: Display Registration Details
function showRegistrationDetails(registration, token) {
  // Display on screen:
  // - Registration Number
  // - Name
  // - Church Name
  // - Total People
  // - Time Slots
  // - Check-in Status
  
  if (registration.checked_in) {
    // Already checked in - show status
    showScreen({
      title: 'Already Checked In ✓',
      registrationNumber: registration.registration_number,
      name: registration.name,
      church: registration.church_name,
      people: registration.total_people,
      checkedInAt: registration.checked_in_at,
      slots: registration.slots,
      showCheckInButton: false  // Don't show button
    });
  } else {
    // Not checked in - show "Check In" button
    showScreen({
      title: 'Registration Details',
      registrationNumber: registration.registration_number,
      name: registration.name,
      church: registration.church_name,
      people: registration.total_people,
      slots: registration.slots,
      showCheckInButton: true,  // Show button
      onCheckInClick: () => promptForAdminPassword(token)
    });
  }
}

// STEP 3: Prompt for Admin Password
function promptForAdminPassword(token) {
  // Show password input dialog
  showPasswordDialog({
    title: 'Admin Authentication Required',
    message: 'Enter admin password to complete check-in',
    onSubmit: (password) => performCheckIn(token, password)
  });
}

// STEP 4: Perform Check-in with Admin Key
async function performCheckIn(token, adminPassword) {
  try {
    const response = await fetch('http://192.168.1.100:3002/api/checkin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token,
        adminKey: adminPassword  // User-entered password
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      if (result.alreadyCheckedIn) {
        showAlert('Already Checked In', 
          `This registration was already checked in at ${new Date(result.registration.checkedInAt).toLocaleString()}`
        );
      } else {
        showAlert('Success! ✓', 
          `Check-in completed for ${result.registration.name}`
        );
        // Refresh the screen to show updated status
        handleQRCodeScan(qrData);
      }
    } else {
      // Wrong password or other error
      showAlert('Error', result.error);
    }
    
  } catch (error) {
    showAlert('Error', 'Failed to complete check-in');
  }
}
```

## React Native Example

```javascript
import React, { useState } from 'react';
import { View, Text, Button, TextInput, Alert, StyleSheet } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

const SERVER_URL = 'http://192.168.1.100:3002';

export default function CheckInApp() {
  const [scanning, setScanning] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [token, setToken] = useState(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');

  // STEP 1: Handle QR Code Scan
  const handleBarCodeScanned = async ({ data }) => {
    setScanning(false);
    
    // Extract token
    const scannedToken = data.split('/').pop();
    setToken(scannedToken);
    
    try {
      // Get registration details (no auth required)
      const response = await fetch(`${SERVER_URL}/api/qr/${scannedToken}`);
      const result = await response.json();
      
      if (result.success) {
        setRegistration(result.registration);
      } else {
        Alert.alert('Error', 'Invalid QR code');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load registration');
    }
  };

  // STEP 2: Handle Check-in Button Click
  const handleCheckInClick = () => {
    setShowPasswordDialog(true);
  };

  // STEP 3: Perform Check-in with Password
  const performCheckIn = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          adminKey: password
        })
      });
      
      const result = await response.json();
      
      setShowPasswordDialog(false);
      setPassword('');
      
      if (result.success) {
        Alert.alert('Success! ✓', `Check-in completed for ${result.registration.name}`);
        // Refresh registration data
        const refreshResponse = await fetch(`${SERVER_URL}/api/qr/${token}`);
        const refreshResult = await refreshResponse.json();
        if (refreshResult.success) {
          setRegistration(refreshResult.registration);
        }
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to complete check-in');
    }
  };

  // Render Scanner
  if (scanning) {
    return (
      <BarCodeScanner
        onBarCodeScanned={handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
    );
  }

  // Render Registration Details
  if (registration) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          {registration.checked_in ? 'Already Checked In ✓' : 'Registration Details'}
        </Text>
        
        <View style={styles.card}>
          <Text style={styles.label}>Registration Number</Text>
          <Text style={styles.value}>{registration.registration_number}</Text>
          
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{registration.name}</Text>
          
          <Text style={styles.label}>Church</Text>
          <Text style={styles.value}>{registration.church_name}</Text>
          
          <Text style={styles.label}>Total People</Text>
          <Text style={styles.value}>{registration.total_people}</Text>
          
          {registration.checked_in && (
            <>
              <Text style={styles.label}>Checked In At</Text>
              <Text style={styles.value}>
                {new Date(registration.checked_in_at).toLocaleString()}
              </Text>
            </>
          )}
        </View>

        {/* Show Check-in Button only if not checked in */}
        {!registration.checked_in && (
          <Button
            title="Check In"
            onPress={handleCheckInClick}
            color="#22c55e"
          />
        )}
        
        <Button
          title="Scan Another QR Code"
          onPress={() => {
            setRegistration(null);
            setToken(null);
            setScanning(true);
          }}
        />

        {/* Password Dialog */}
        {showPasswordDialog && (
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Admin Authentication</Text>
            <Text style={styles.dialogMessage}>Enter admin password to complete check-in</Text>
            <TextInput
              style={styles.input}
              placeholder="Admin Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <View style={styles.dialogButtons}>
              <Button title="Cancel" onPress={() => {
                setShowPasswordDialog(false);
                setPassword('');
              }} />
              <Button title="Check In" onPress={performCheckIn} />
            </View>
          </View>
        )}
      </View>
    );
  }

  // Render Start Screen
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bible Exhibition Check-in</Text>
      <Button
        title="Scan QR Code"
        onPress={() => setScanning(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 5,
  },
  dialog: {
    position: 'absolute',
    top: '30%',
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dialogMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
```

## API Endpoints Used

### 1. Get Registration Details (No Auth)
```
GET /api/qr/{token}
```

**Response:**
```json
{
  "success": true,
  "registration": {
    "registration_number": "BE-ABC123",
    "name": "John Doe",
    "church_name": "St. Mary's Church",
    "total_people": 15,
    "checked_in": false,
    "checked_in_at": null,
    "slots": [...]
  }
}
```

### 2. Check-in (Requires Admin Key)
```
POST /api/checkin
{
  "token": "d08b9fc07b5c1d23f466998e09956a1bd82f330b80986966e01c0dcfeedbc945",
  "adminKey": "admin123"
}
```

**Response:**
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

## User Flow Summary

1. **Scan QR Code** → App shows registration details
2. **View Details** → User sees name, church, people count, slots
3. **Check Status** → App shows if already checked in or not
4. **Click "Check In"** → App prompts for admin password
5. **Enter Password** → User enters admin password
6. **Verify** → App calls check-in API with password
7. **Success** → Registration marked as checked in
8. **Refresh** → Screen updates to show "Already Checked In ✓"

## Security Benefits

✅ **Two-step verification**: Scan first, authenticate second
✅ **Password not stored**: User enters password each time
✅ **Read-only scan**: Anyone can scan to see details
✅ **Protected action**: Only authorized users can check in
✅ **Audit trail**: System records who checked in and when

## Testing

1. **Test Read-Only Access:**
   - Scan QR code
   - Should show registration details
   - No password required

2. **Test Check-in with Correct Password:**
   - Click "Check In"
   - Enter: `admin123`
   - Should succeed

3. **Test Check-in with Wrong Password:**
   - Click "Check In"
   - Enter: `wrong`
   - Should show error: "Unauthorized: Invalid admin key"

4. **Test Already Checked In:**
   - Scan same QR code again
   - Should show "Already Checked In ✓"
   - "Check In" button should not appear