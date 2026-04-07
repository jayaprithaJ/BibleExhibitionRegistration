'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Register for Bible Exhibition
          </h1>

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
                <option value="2026-06-05">Friday, June 5 (6 PM - 9 PM)</option>
                <option value="2026-06-06">Saturday, June 6 (9 AM - 8 PM)</option>
                <option value="2026-06-07">Sunday, June 7 (9 AM - 8 PM)</option>
                <option value="2026-06-12">Friday, June 12 (6 PM - 9 PM)</option>
                <option value="2026-06-13">Saturday, June 13 (9 AM - 8 PM)</option>
                <option value="2026-06-14">Sunday, June 14 (9 AM - 8 PM)</option>
                <option value="2026-06-19">Friday, June 19 (6 PM - 9 PM)</option>
                <option value="2026-06-20">Saturday, June 20 (9 AM - 8 PM)</option>
                <option value="2026-06-21">Sunday, June 21 (9 AM - 8 PM)</option>
              </select>
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

            {/* Phone (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+91 9876543210"
              />
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
