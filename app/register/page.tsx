'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    churchName: '',
    preferredDate: '2026-06-06',
    totalPeople: 10,
    tamilCount: 5,
    englishCount: 5,
    phone: '',
    email: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Registration successful!');
        router.push(`/confirmation?reg=${result.registrationNumber}`);
      } else if (result.errorCode === 'DATE_FULLY_BOOKED') {
        toast.error(result.error);
        // Show alternative dates
        console.log('Alternative dates:', result.alternativeDates);
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            💡 <strong>Already registered?</strong> Visit the{' '}
            <Link href="/lookup" className="underline font-semibold hover:text-blue-900">
              Lookup Page
            </Link>{' '}
            to view or manage your registrations using your phone number.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Register for Bible Exhibition
            </h1>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              ← Back
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>

            {/* Church Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Church Name *
              </label>
              <input
                type="text"
                required
                value={formData.churchName}
                onChange={(e) =>
                  setFormData({ ...formData, churchName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your church name"
              />
            </div>

            {/* Preferred Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Date *
              </label>
              <select
                required
                value={formData.preferredDate}
                onChange={(e) =>
                  setFormData({ ...formData, preferredDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <optgroup label="Weekends (Recommended)">
                  <option value="2026-06-06">Saturday, June 6 (1:30 PM - 8:00 PM)</option>
                  <option value="2026-06-07">Sunday, June 7 (9:30 AM - 8:00 PM)</option>
                  <option value="2026-06-13">Saturday, June 13 (1:30 PM - 8:00 PM)</option>
                  <option value="2026-06-14">Sunday, June 14 (9:30 AM - 8:00 PM)</option>
                  <option value="2026-06-20">Saturday, June 20 (1:30 PM - 8:00 PM)</option>
                  <option value="2026-06-21">Sunday, June 21 (9:30 AM - 8:00 PM)</option>
                </optgroup>
                <optgroup label="Weekdays (5:00 PM - 8:00 PM) - Open to Public">
                  <option value="2026-06-09">Monday, June 9 (5:00 PM - 8:00 PM) ⚠️ Public Hours</option>
                  <option value="2026-06-10">Tuesday, June 10 (5:00 PM - 8:00 PM) ⚠️ Public Hours</option>
                  <option value="2026-06-11">Wednesday, June 11 (5:00 PM - 8:00 PM) ⚠️ Public Hours</option>
                  <option value="2026-06-16">Monday, June 16 (5:00 PM - 8:00 PM) ⚠️ Public Hours</option>
                  <option value="2026-06-17">Tuesday, June 17 (5:00 PM - 8:00 PM) ⚠️ Public Hours</option>
                  <option value="2026-06-18">Wednesday, June 18 (5:00 PM - 8:00 PM) ⚠️ Public Hours</option>
                </optgroup>
              </select>
              <div className="mt-2 space-y-2">
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                  <strong>⚠️ Weekday Note:</strong> Evening sessions (5-8 PM) are open to the public. Expect possible delays due to walk-in visitors. For exclusive group time, call to book other hours.
                </p>
                <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded p-2">
                  <strong>📞 Friday & Custom Times:</strong> Call church office for Friday slots or to arrange exclusive group bookings at other times.
                </p>
              </div>
            </div>

            {/* Total People */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total People *
              </label>
              <input
                type="number"
                required
                min="1"
                max="50"
                value={formData.totalPeople}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalPeople: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Language Split */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamil Count *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.tamilCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tamilCount: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  English Count *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.englishCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      englishCount: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Phone (Required) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+91 9876543210"
                minLength={10}
                maxLength={20}
              />
              <p className="mt-1 text-xs text-gray-500">
                Required for registration lookup and modifications
              </p>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Registering...' : 'Register Now'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
