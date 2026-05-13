'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Calendar, Users, Clock, Edit2, Trash2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Registration {
  id: string;
  registration_number: string;
  name: string;
  church_name: string;
  preferred_date: string;
  total_people: number;
  tamil_count: number;
  english_count: number;
  phone: string;
  email: string;
  created_at: string;
  checked_in: boolean;
  slot_info: string;
  slot_times: string;
  qr_token: string;
}

function LookupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  // Auto-search if phone is in URL
  useEffect(() => {
    const phoneFromUrl = searchParams.get('phone');
    if (phoneFromUrl) {
      setPhone(phoneFromUrl);
      performSearch(phoneFromUrl);
    }
  }, [searchParams]);

  const performSearch = async (phoneNumber: string) => {
    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const response = await fetch(`/api/lookup?phone=${encodeURIComponent(phoneNumber)}`);
      const data = await response.json();

      if (data.success) {
        setRegistrations(data.registrations);
        if (data.registrations.length === 0) {
          setError('No registrations found for this phone number.');
        }
      } else {
        setError(data.error || 'Failed to search registrations');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim()) {
      performSearch(phone);
    }
  };

  const handleDelete = async (id: string, regNumber: string) => {
    if (!confirm(`Are you sure you want to cancel registration ${regNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/register/${regNumber}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        alert('Registration cancelled successfully');
        // Refresh the list
        handleSearch(new Event('submit') as any);
      } else {
        alert(data.error || 'Failed to cancel registration');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('An error occurred. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lookup Your Registration
          </h1>
          <p className="text-gray-600">
            Enter your phone number to view or modify your registrations
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+91 9876543210"
                minLength={10}
                maxLength={20}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Search className="w-5 h-5" />
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {searched && registrations.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Registrations ({registrations.length})
            </h2>

            {registrations.map((reg) => (
              <div
                key={reg.id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {reg.name}
                      </h3>
                      {reg.checked_in && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Checked In
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">{reg.church_name}</p>
                    <p className="text-sm text-gray-500 font-mono mt-1">
                      Registration: {reg.registration_number}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/qr/${reg.qr_token}`}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      View QR Code
                    </Link>
                    {!reg.checked_in && (
                      <button
                        onClick={() => handleDelete(reg.id, reg.registration_number)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Exhibition Date</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(reg.preferred_date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Total People</p>
                      <p className="font-semibold text-gray-900">
                        {reg.total_people} people
                      </p>
                      <p className="text-xs text-gray-500">
                        Tamil: {reg.tamil_count} | English: {reg.english_count}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Registered On</p>
                      <p className="font-semibold text-gray-900">
                        {formatDateTime(reg.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Slot Information */}
                {reg.slot_info && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900 mb-2">
                      Your Time Slots:
                    </p>
                    <p className="text-sm text-blue-800">{reg.slot_info}</p>
                  </div>
                )}

                {/* Contact Info */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex gap-6 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Phone:</span> {reg.phone}
                    </div>
                    {reg.email && (
                      <div>
                        <span className="font-medium">Email:</span> {reg.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {searched && registrations.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Registrations Found
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any registrations for this phone number.
            </p>
            <Link
              href="/register"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Register Now
            </Link>
          </div>
        )}

        {/* QR Code Instructions */}
        <div className="mt-8 bg-green-50 border-2 border-green-500 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-3 text-lg flex items-center gap-2">
            <CheckCircle className="w-6 h-6" />
            At the Exhibition Venue
          </h3>
          <div className="bg-white rounded-lg p-4 mb-3">
            <p className="text-green-900 font-bold text-lg mb-2">
              📱 Show Your QR Code at Entry
            </p>
            <p className="text-green-800">
              Click "View QR Code" above and show it to staff at the entrance. They will scan it for quick check-in.
            </p>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• You can register up to 2 times with the same phone number for different dates</li>
            <li>• Save QR code screenshot or access it anytime from this page</li>
            <li>• You can cancel your registration before check-in</li>
            <li>• Contact us if you need to modify your registration details</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function LookupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LookupContent />
    </Suspense>
  );
}

// Made with Bob