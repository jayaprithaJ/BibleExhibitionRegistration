'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Phone, Mail, Users, Church, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SpotRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    churchName: '',
    totalPeople: 1,
    phone: '',
    email: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate at least one contact method
    if (!formData.phone && !formData.email) {
      toast.error('Please provide either phone number or email');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/spot-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setRegistrationNumber(result.registrationNumber);
        setSuccess(true);
        toast.success('Spot registration successful!');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setRegistrationNumber('');
    setFormData({
      name: '',
      churchName: '',
      totalPeople: 1,
      phone: '',
      email: '',
    });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Registration Successful!
            </h1>
            <p className="text-gray-600">Walk-in visitor registered</p>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">Registration Number</p>
            <p className="text-3xl font-bold text-green-600 mb-2">
              {registrationNumber}
            </p>
            <p className="text-xs text-gray-500">
              Registered at: {new Date().toLocaleString('en-IN', { 
                timeZone: 'Asia/Kolkata',
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </p>
          </div>

          <button
            onClick={handleReset}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Register Another Visitor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <UserPlus className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Spot Registration
            </h1>
            <p className="text-gray-600">
              Quick registration for walk-in visitors
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This form is for on-site walk-in registrations only. 
              No time slot selection needed - visitors will be accommodated immediately.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visitor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter visitor's name"
              />
            </div>

            {/* Church Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Church Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Church className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.churchName}
                  onChange={(e) => setFormData({ ...formData, churchName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter church name"
                />
              </div>
            </div>

            {/* Total People */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of People <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  required
                  min="1"
                  max="50"
                  value={formData.totalPeople}
                  onChange={(e) => setFormData({ ...formData, totalPeople: parseInt(e.target.value) || 1 })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maximum 50 people per registration
              </p>
            </div>

            {/* Contact Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Provide at least one contact method (phone or email)
              </p>

              {/* Phone */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-lg"
            >
              {loading ? 'Registering...' : 'Register Visitor'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>For pre-scheduled registrations, use the main registration form</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob