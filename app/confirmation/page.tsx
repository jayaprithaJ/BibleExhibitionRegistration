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

  const getQRCodeValue = () => {
    if (!details?.qr_token) {
      return `${window.location.origin}/confirmation?reg=${registrationNumber}`;
    }
    return `${window.location.origin}/qr/${details.qr_token}`;
  };

  if (!registrationNumber) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">No registration found</p>
          <Link href="/register" className="text-cyan-400 hover:underline">
            Go to Registration
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">Loading registration details...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-cyan-400 mb-2" style={{ fontFamily: 'Impact, sans-serif' }}>
            BIBLIO '26
          </h1>
        </div>

        <div className="bg-slate-800 border-2 border-cyan-500/30 rounded-lg shadow-2xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          
          <h2 className="text-3xl font-bold text-white mb-6">
            Registration Successful!
          </h2>

          {/* QR Code Section */}
          <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-lg p-6 mb-6">
            <p className="text-sm text-slate-400 mb-2">Registration Number</p>
            <p className="text-3xl font-bold text-cyan-400 mb-4">
              {registrationNumber}
            </p>
            
            <div className="bg-white p-4 rounded-lg inline-block">
              <QRCodeSVG
                value={getQRCodeValue()}
                size={150}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-xs text-slate-400 mt-3">
              <QrCode className="w-4 h-4 inline mr-1" />
              Show this QR code at the exhibition entrance
            </p>
          </div>

          {details && (
            <>
              {/* Registration Details */}
              <div className="bg-slate-900/50 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Details
                </h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <p><span className="text-slate-400">Name:</span> {details.name}</p>
                  <p><span className="text-slate-400">Church:</span> {details.church_name}</p>
                  <p><span className="text-slate-400">Total:</span> {details.total_people} people</p>
                  {details.tamil_count > 0 && (
                    <p><span className="text-slate-400">Tamil:</span> {details.tamil_count}</p>
                  )}
                  {details.english_count > 0 && (
                    <p><span className="text-slate-400">English:</span> {details.english_count}</p>
                  )}
                </div>
              </div>

              {/* Time Slots */}
              <div className="bg-green-900/30 border-2 border-green-500/50 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-green-400 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Your Time Slots
                </h3>
                <div className="space-y-3">
                  {details.slots
                    .sort((a, b) => {
                      const timeA = new Date(`2000-01-01T${a.slot_time}`);
                      const timeB = new Date(`2000-01-01T${b.slot_time}`);
                      return timeA.getTime() - timeB.getTime();
                    })
                    .map((slot, index) => (
                      <div key={index} className="bg-slate-800 rounded-lg p-4 border border-green-500/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-2xl font-bold text-green-400">
                              {formatTime(slot.slot_time)}
                            </p>
                            <p className="text-sm text-slate-300 capitalize">
                              {slot.language} • {slot.people_count} people
                            </p>
                            <p className="text-xs text-slate-400">
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

          {/* Instructions */}
          <div className="text-left bg-cyan-900/30 border border-cyan-500/30 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-cyan-400 mb-3 flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              At the Venue
            </h3>
            <ul className="text-sm text-slate-300 space-y-2">
              <li>✓ Save this QR code (screenshot or bookmark)</li>
              <li>✓ Arrive 10 minutes before your time</li>
              <li>✓ Show QR code at entrance for scanning</li>
              <li>✓ Audio guides provided in your language</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/"
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-slate-900 rounded-lg font-bold transition-colors"
            >
              Home
            </Link>
            <Link
              href="/lookup"
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors"
            >
              My Registrations
            </Link>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'BIBLIO \'26 Registration',
                    text: `Registration: ${registrationNumber}`,
                    url: window.location.href,
                  }).catch(() => {});
                } else {
                  window.print();
                }
              }}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-colors"
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
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}

// Made with Bob
