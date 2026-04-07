'use client';

import { useState, useEffect } from 'react';
import { Users, Calendar, TrendingUp, Clock, RefreshCw, Trash2, List } from 'lucide-react';

interface DateBreakdown {
  slot_date: string;
  day_type: string;
  total_capacity: number;
  filled_capacity: number;
  available_capacity: number;
  fill_percentage: number;
  total_slots: number;
  full_slots: number;
}

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
  slot_info: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    todayRegistrations: 0,
    totalPeople: 0,
    totalCapacity: 0,
    filledCapacity: 0,
    availableCapacity: 0,
    fillPercentage: 0,
  });
  const [dateBreakdown, setDateBreakdown] = useState<DateBreakdown[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setDateBreakdown(data.dateBreakdown);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const response = await fetch('/api/admin/registrations');
      const data = await response.json();
      if (data.success) {
        setRegistrations(data.registrations);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const handleDelete = async (id: string, regNumber: string) => {
    if (!confirm(`Are you sure you want to delete registration ${regNumber}? This will free up the allocated slots.`)) {
      return;
    }

    setDeleting(id);
    try {
      const response = await fetch(`/api/admin/registrations/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        alert('Registration deleted successfully');
        fetchRegistrations();
        fetchStats();
      } else {
        alert('Failed to delete registration');
      }
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert('Error deleting registration');
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRegistrations();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalRegistrations}</p>
            <p className="text-sm text-gray-600 mt-1">Total Registrations</p>
            <p className="text-xs text-gray-500 mt-1">{stats.totalPeople} people</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-green-600" />
              <span className="text-sm text-gray-500">Today</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.todayRegistrations}</p>
            <p className="text-sm text-gray-600 mt-1">Today's Registrations</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-sm text-gray-500">Filled</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.fillPercentage}%
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {stats.filledCapacity} / {stats.totalCapacity}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-orange-600" />
              <span className="text-sm text-gray-500">Available</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.availableCapacity}
            </p>
            <p className="text-sm text-gray-600 mt-1">Spots Remaining</p>
          </div>
        </div>

        {/* Date-wise Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Date-wise Slot Status
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Capacity</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Filled</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Available</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Fill %</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {dateBreakdown.map((date, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{formatDate(date.slot_date)}</td>
                    <td className="py-3 px-4 text-center">{date.total_capacity}</td>
                    <td className="py-3 px-4 text-center font-semibold text-blue-600">{date.filled_capacity}</td>
                    <td className="py-3 px-4 text-center font-semibold text-green-600">{date.available_capacity}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              date.fill_percentage > 80 ? 'bg-red-500' :
                              date.fill_percentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${date.fill_percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{date.fill_percentage}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        date.fill_percentage >= 100 ? 'bg-red-100 text-red-700' :
                        date.fill_percentage >= 80 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {date.fill_percentage >= 100 ? 'Full' :
                         date.fill_percentage >= 80 ? 'Filling' : 'Available'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Registrations List */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              All Registrations
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  fetchRegistrations();
                  fetchStats();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => setShowRegistrations(!showRegistrations)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <List className="w-4 h-4" />
                {showRegistrations ? 'Hide' : 'Show'} List
              </button>
            </div>
          </div>

          {showRegistrations && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Reg #</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Church</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">People</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Time Slots</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{reg.registration_number}</td>
                      <td className="py-3 px-4">{reg.name}</td>
                      <td className="py-3 px-4">{reg.church_name}</td>
                      <td className="py-3 px-4">{formatDate(reg.preferred_date)}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-sm">
                          <div className="font-semibold">{reg.total_people}</div>
                          <div className="text-xs text-gray-500">
                            T:{reg.tamil_count} E:{reg.english_count}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {reg.slot_info || 'No slots assigned'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDelete(reg.id, reg.registration_number)}
                          disabled={deleting === reg.id}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 transition-colors text-sm"
                        >
                          <Trash2 className="w-3 h-3" />
                          {deleting === reg.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {registrations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        No registrations found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Exhibition Schedule
          </h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900">Weekends</h3>
              <p className="text-gray-600">
                Saturdays & Sundays: 9 AM - 8 PM (660 capacity/day)
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900">Fridays</h3>
              <p className="text-gray-600">
                Evening Sessions: 6 PM - 9 PM (180 capacity/day)
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-gray-900">Total Capacity</h3>
              <p className="text-gray-600">
                9 active days: {stats.totalCapacity} people total
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
