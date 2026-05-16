'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Calendar, Users, Clock, Trash2, CheckCircle } from 'lucide-react';
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
    if (!confirm(`Cancel registration ${regNumber}? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/register/${regNumber}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        alert('Registration cancelled successfully');
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-black text-cyan-400 mb-2" style={{ fontFamily: 'Impact, sans-serif' }}>
            BIBLIO '26
          </h1>
          <p className="text-slate-300 text-xl">
            Lookup Your Registration
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-slate-800 border-2 border-cyan-500/30 rounded-lg shadow-xl p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                placeholder="+91 9876543210"
                minLength={10}
                maxLength={20}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-slate-900 rounded-lg font-bold disabled:bg-slate-600 transition-colors"
              >
                <Search className="w-5 h-5" />
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border-2 border-red-500 rounded-lg p-4 mb-8">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Results */}
        {searched && registrations.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-yellow-400">
              Your Registrations ({registrations.length})
            </h2>

            {registrations.map((reg) => (
              <div
                key={reg.id}
                className="bg-slate-800 border-2 border-cyan-500/30 rounded-lg shadow-xl p-6"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-xl font-bold text-white">
                        {reg.name}
                      </h3>
                      {reg.checked_in && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Checked In
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300">{reg.church_name}</p>
                    <p className="text-sm text-cyan-400 font-mono mt-1">
                      {reg.registration_number}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Link
                      href={`/qr/${reg.qr_token}`}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-900 rounded-lg font-bold transition-colors text-sm"
                    >
                      View QR
                    </Link>
                    {!reg.checked_in && (
                      <button
                        onClick={() => handleDelete(reg.id, reg.registration_number)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors text-sm"
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
                    <Calendar className="w-5 h-5 text-cyan-400 mt-1" />
                    <div>
                      <p className="text-sm text-slate-400">Date</p>
                      <p className="font-semibold text-white">
                        {formatDate(reg.preferred_date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-cyan-400 mt-1" />
                    <div>
                      <p className="text-sm text-slate-400">People</p>
                      <p className="font-semibold text-white">
                        {reg.total_people}
                      </p>
                      <p className="text-xs text-slate-500">
                        Tamil: {reg.tamil_count} | English: {reg.english_count}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-cyan-400 mt-1" />
                    <div>
                      <p className="text-sm text-slate-400">Registered</p>
                      <p className="font-semibold text-white">
                        {formatDateTime(reg.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Slot Information */}
                {reg.slot_info && (
                  <div className="bg-cyan-900/30 border border-cyan-500/30 rounded-lg p-4">
                    <p className="text-sm font-medium text-cyan-400 mb-2">
                      Time Slots:
                    </p>
                    <p className="text-sm text-slate-300">{reg.slot_info}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {searched && registrations.length === 0 && !error && (
          <div className="bg-slate-800 border-2 border-cyan-500/30 rounded-lg shadow-xl p-8 text-center">
            <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Registrations Found
            </h3>
            <p className="text-slate-400 mb-6">
              No registrations found for this phone number.
            </p>
            <Link
              href="/register"
              className="inline-block px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-slate-900 rounded-lg font-bold transition-colors"
            >
              Register Now
            </Link>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-green-900/30 border-2 border-green-500/50 rounded-lg p-6">
          <h3 className="font-semibold text-green-400 mb-3 text-lg flex items-center gap-2">
            <CheckCircle className="w-6 h-6" />
            At the Exhibition
          </h3>
          <p className="text-slate-300 mb-3">
            📱 Click "View QR" and show it to staff at the entrance for quick check-in.
          </p>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>• Save QR code screenshot or bookmark the page</li>
            <li>• You can cancel registration before check-in</li>
            <li>• Contact us for any modifications needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function LookupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    }>
      <LookupContent />
    </Suspense>
  );
}

// Made with Bob