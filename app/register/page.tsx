'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
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

  // Check if registration is open
  useState(() => {
    const registrationOpenDate = new Date('2026-03-28T00:00:00+05:30');
    const now = new Date();
    setRegistrationOpen(now >= registrationOpenDate);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registrationOpen) {
      toast.error('Registration is not yet open. Please check back on March 28, 2026.');
      return;
    }
    
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-cyan-400 mb-2" style={{ fontFamily: 'Impact, sans-serif' }}>
            BIBLIO '26
          </h1>
          <p className="text-yellow-400 text-xl font-bold">Group Registration</p>
        </div>

        {/* Registration Closed Notice */}
        {!registrationOpen && (
          <div className="bg-red-900/30 border-2 border-red-500 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-3xl">🔒</div>
              <div>
                <h2 className="text-xl font-bold text-red-400 mb-2">
                  Registration Opens March 28, 2026
                </h2>
                <p className="text-red-300 mb-2">
                  Online registration is currently closed and will open on <strong>March 28, 2026</strong>.
                </p>
                <p className="text-red-200 text-sm">
                  Please check back after this date to register your group.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-cyan-900/30 border border-cyan-500/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-cyan-300">
            💡 <strong>Already registered?</strong> Visit the{' '}
            <Link href="/lookup" className="underline font-semibold hover:text-cyan-200">
              Lookup Page
            </Link>{' '}
            to view or manage your registrations.
          </p>
        </div>

        <div className="bg-slate-800 border-2 border-cyan-500/30 rounded-lg shadow-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              Register Your Group
            </h2>
            <Link
              href="/"
              className="text-cyan-400 hover:text-cyan-300 text-sm"
            >
              ← Back
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                placeholder="Enter your name"
              />
            </div>

            {/* Church Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Church Name *
              </label>
              <input
                type="text"
                required
                value={formData.churchName}
                onChange={(e) =>
                  setFormData({ ...formData, churchName: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                placeholder="Enter your church name"
              />
            </div>

            {/* Preferred Date */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Preferred Date *
              </label>
              <select
                required
                value={formData.preferredDate}
                onChange={(e) =>
                  setFormData({ ...formData, preferredDate: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
              >
                <optgroup label="Weekends (Recommended)">
                  <option value="2026-06-06">Saturday, June 6</option>
                  <option value="2026-06-07">Sunday, June 7</option>
                  <option value="2026-06-13">Saturday, June 13</option>
                  <option value="2026-06-14">Sunday, June 14</option>
                  <option value="2026-06-20">Saturday, June 20</option>
                  <option value="2026-06-21">Sunday, June 21</option>
                </optgroup>
                <optgroup label="Weekdays (5-8 PM) - Open to Public">
                  <option value="2026-06-09">Monday, June 9</option>
                  <option value="2026-06-10">Tuesday, June 10</option>
                  <option value="2026-06-11">Wednesday, June 11</option>
                  <option value="2026-06-16">Monday, June 16</option>
                  <option value="2026-06-17">Tuesday, June 17</option>
                  <option value="2026-06-18">Wednesday, June 18</option>
                </optgroup>
              </select>
              <p className="text-xs text-amber-400 mt-2">
                ⚠️ Weekdays are open to public. For exclusive slots or Friday bookings, call the church office.
              </p>
            </div>

            {/* Total People */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
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
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
              />
            </div>

            {/* Language Split */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
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
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
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
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                placeholder="+91 9876543210"
                minLength={10}
                maxLength={20}
              />
              <p className="mt-1 text-xs text-slate-400">
                Required for registration lookup
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                placeholder="your@email.com"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !registrationOpen}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-900 py-3 rounded-lg font-bold disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              {!registrationOpen ? 'Registration Opens March 28, 2026' : loading ? 'Registering...' : 'Register Now'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
