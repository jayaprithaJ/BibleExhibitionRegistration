'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, Shield } from 'lucide-react';

interface SlotInfo {
  language: string;
  slot_date: string;
  slot_time: string;
  people_count: number;
  group_sequence: number;
}

interface RegistrationInfo {
  registration_number: string;
  name: string;
  church_name: string;
  total_people: number;
  tamil_count: number;
  english_count: number;
  checked_in: boolean;
  checked_in_at: string | null;
  slots: SlotInfo[];
}

export default function QRViewPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [registration, setRegistration] = useState<RegistrationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInError, setCheckInError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetch(`/api/qr/${token}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setRegistration(data.registration);
          } else {
            setError(data.error || 'Invalid QR code');
          }
        })
        .catch((err) => {
          console.error('Error fetching registration:', err);
          setError('Failed to load registration details');
        })
        .finally(() => setLoading(false));
    }
  }, [token]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleAdminCheckIn = async () => {
    if (!adminPassword.trim()) {
      setCheckInError('Please enter admin password');
      return;
    }

    setCheckingIn(true);
    setCheckInError(null);

    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registration_number: registration?.registration_number,
          admin_password: adminPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the page to show updated check-in status
        window.location.reload();
      } else {
        setCheckInError(data.error || 'Failed to check in');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setCheckInError('Failed to check in. Please try again.');
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading registration details...</p>
        </div>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid QR Code</h1>
          <p className="text-gray-600">{error || 'This QR code is not valid or has expired.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          {/* Check-in Status */}
          {registration.checked_in ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                  <h2 className="text-lg font-semibold text-green-900">Checked In</h2>
                  <p className="text-sm text-green-700">
                    {registration.checked_in_at && 
                      `Checked in at ${new Date(registration.checked_in_at).toLocaleString()}`
                    }
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div>
                  <h2 className="text-lg font-semibold text-blue-900">Pending Check-in</h2>
                  <p className="text-sm text-blue-700">
                    Please present this QR code at the exhibition entrance
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Registration Details */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
              Registration Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Registration Number</p>
                  <p className="font-semibold text-gray-900">{registration.registration_number}</p>
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{registration.name}</p>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm text-gray-500">Church</p>
                <p className="font-medium text-gray-900">{registration.church_name}</p>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm text-gray-500">Total People</p>
                <p className="font-medium text-gray-900">{registration.total_people}</p>
              </div>
              {registration.tamil_count > 0 && (
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500">Tamil Group</p>
                  <p className="font-medium text-gray-900">{registration.tamil_count} people</p>
                </div>
              )}
              {registration.english_count > 0 && (
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500">English Group</p>
                  <p className="font-medium text-gray-900">{registration.english_count} people</p>
                </div>
              )}
            </div>
          </div>

          {/* Time Slots */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Assigned Time Slots
            </h3>
            <div className="space-y-3">
              {registration.slots
                .sort((a, b) => {
                  const timeA = new Date(`2000-01-01T${a.slot_time}`);
                  const timeB = new Date(`2000-01-01T${b.slot_time}`);
                  return timeA.getTime() - timeB.getTime();
                })
                .map((slot, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-green-300">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                          Batch {index + 1}
                        </p>
                        <p className="text-xl font-bold text-green-600 mb-1">
                          {formatTime(slot.slot_time)}
                        </p>
                        <p className="font-semibold text-gray-900 capitalize">
                          {slot.language} Group - {slot.people_count} people
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {formatDate(slot.slot_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Important Instructions:</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
              <li>Arrive 10 minutes before your scheduled time</li>
              <li>Save this confirmation on your mobile device or take a screenshot</li>
              <li>Show your registration number or QR code at entry</li>
              <li>Audio guides will be provided in your selected language</li>
              {registration.slots.length > 1 && (
                <li>Your group is split into {registration.slots.length} batches - call each batch at their designated time</li>
              )}
            </ul>
          </div>

          {/* Admin Check-in Section */}
          {!registration.checked_in && (
            <div className="mt-6 border-t pt-6">
              {!showAdminPrompt ? (
                <button
                  onClick={() => setShowAdminPrompt(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  <Shield className="w-4 h-4" />
                  Admin: Mark as Completed
                </button>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Admin Check-in
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1">
                        Admin Password
                      </label>
                      <input
                        id="admin-password"
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAdminCheckIn();
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter admin password"
                        disabled={checkingIn}
                      />
                    </div>
                    {checkInError && (
                      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                        {checkInError}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handleAdminCheckIn}
                        disabled={checkingIn}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {checkingIn ? 'Checking in...' : 'Complete Check-in'}
                      </button>
                      <button
                        onClick={() => {
                          setShowAdminPrompt(false);
                          setAdminPassword('');
                          setCheckInError(null);
                        }}
                        disabled={checkingIn}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Made with Bob
