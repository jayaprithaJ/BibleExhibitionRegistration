'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Clock, Calendar, Users, QrCode } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface SlotAssignment {
  language: string;
  slot_date: string;
  slot_time: string;
  people_count: number;
}

interface RegistrationDetails {
  registration_number: string;
  name: string;
  church_name: string;
  preferred_date: string;
  total_people: number;
  tamil_count: number;
  english_count: number;
  qr_token?: string;
  slots: SlotAssignment[];
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const registrationNumber = searchParams.get('reg');
  const [details, setDetails] = useState<RegistrationDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (registrationNumber) {
      fetch(`/api/register/${registrationNumber}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setDetails(data.registration);
          }
        })
        .catch((error) => console.error('Error fetching registration:', error))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [registrationNumber]);

  // Generate QR code URL with secure token
  const getQRCodeValue = () => {
    if (!details?.qr_token) {
      return `${window.location.origin}/confirmation?reg=${registrationNumber}`;
    }
    return `${window.location.origin}/api/qr/${details.qr_token}`;
  };

  if (!registrationNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No registration found</p>
          <Link
            href="/register"
            className="text-blue-600 hover:underline"
          >
            Go to Registration
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading registration details...</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Registration Successful!
          </h1>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">
              Your Registration Number
            </p>
            <p className="text-3xl font-bold text-blue-600 mb-4">
              {registrationNumber}
            </p>
            
            {/* QR Code */}
            <div className="bg-white p-4 rounded-lg inline-block">
              <QRCodeSVG
                value={getQRCodeValue()}
                size={150}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <QrCode className="w-4 h-4 inline mr-1" />
              Scan this QR code for check-in at the exhibition
            </p>
          </div>

          {details && (
            <>
              {/* Registration Details */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Registration Details
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {details.name}</p>
                  <p><span className="font-medium">Church:</span> {details.church_name}</p>
                  <p><span className="font-medium">Total People:</span> {details.total_people}</p>
                  {details.tamil_count > 0 && (
                    <p><span className="font-medium">Tamil Group:</span> {details.tamil_count} people</p>
                  )}
                  {details.english_count > 0 && (
                    <p><span className="font-medium">English Group:</span> {details.english_count} people</p>
                  )}
                </div>
              </div>

              {/* Time Slots */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Your Assigned Time Slots (Call Order)
                </h3>
                <div className="space-y-4">
                  {details.slots
                    .sort((a, b) => {
                      // Sort by time to show chronological order
                      const timeA = new Date(`2000-01-01T${a.slot_time}`);
                      const timeB = new Date(`2000-01-01T${b.slot_time}`);
                      return timeA.getTime() - timeB.getTime();
                    })
                    .map((slot, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-green-300">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                              Batch {index + 1} - Call at this time
                            </p>
                            <p className="text-2xl font-bold text-green-600 mb-2">
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
            </>
          )}

          <div className="text-left space-y-4 mb-8">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Important Instructions:
              </h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Please arrive 10 minutes before your scheduled time</li>
                <li>Save this confirmation on your mobile device or take a screenshot</li>
                <li>Show your registration number or QR code at entry</li>
                <li>Audio guides will be provided in your selected language</li>
              </ul>
            </div>

            {details && details.slots.length > 1 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>📋 Batch Call Sequence:</strong> Your group has been split into {details.slots.length} batches.
                  {details.slots.length > 2 && ' This is because your group size requires multiple time slots.'}
                  {' '}Call each batch in the numbered order shown above at their designated times.
                  Each batch should arrive 10 minutes before their scheduled time.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </Link>
            <button
              onClick={() => {
                // Take screenshot or save page
                if (navigator.share) {
                  navigator.share({
                    title: 'Bible Exhibition Registration',
                    text: `Registration Number: ${registrationNumber}`,
                    url: window.location.href,
                  }).catch(() => {});
                } else {
                  window.print();
                }
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Save / Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}

// Made with Bob
