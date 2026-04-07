'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Users, Calendar, TrendingUp, Clock, RefreshCw, Trash2, List, Filter, CheckCircle, XCircle, Layers, Settings } from 'lucide-react';

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
  checked_in: boolean;
  checked_in_at: string | null;
  slot_info: string;
  slot_times: string;
}

interface Batch {
  registration_id: string;
  registration_number: string;
  church_name: string;
  slot_date: string;
  slot_time: string;
  language: string;
  people_count: number;
  group_sequence: number;
  checked_in: boolean;
  checked_in_at: string | null;
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
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [showBatches, setShowBatches] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'registrations' | 'batches'>('batches');
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [filterTime, setFilterTime] = useState<string>('all');
  const [filterLanguage, setFilterLanguage] = useState<'all' | 'tamil' | 'english'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/stats', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
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
      const response = await fetch('/api/admin/registrations', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();
      if (data.success) {
        setRegistrations(data.registrations);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/admin/batches', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();
      if (data.success) {
        setBatches(data.batches);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
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
    fetchBatches();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get unique dates and times for filters
  const uniqueDates = useMemo(() => {
    const dates = new Set(registrations.map(r => r.preferred_date));
    return Array.from(dates).sort();
  }, [registrations]);

  const uniqueTimes = useMemo(() => {
    const times = new Set<string>();
    if (viewMode === 'batches') {
      batches.forEach(b => times.add(b.slot_time));
    } else {
      registrations.forEach(r => {
        if (r.slot_times) {
          r.slot_times.split(', ').forEach(time => times.add(time));
        }
      });
    }
    return Array.from(times).sort();
  }, [registrations, batches, viewMode]);

  // Filter registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      // Status filter
      if (filterStatus === 'completed' && !reg.checked_in) return false;
      if (filterStatus === 'pending' && reg.checked_in) return false;

      // Date filter
      if (filterDate !== 'all' && reg.preferred_date !== filterDate) return false;

      // Time filter
      if (filterTime !== 'all' && !reg.slot_times?.includes(filterTime)) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          reg.registration_number.toLowerCase().includes(query) ||
          reg.name.toLowerCase().includes(query) ||
          reg.church_name.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [registrations, filterStatus, filterDate, filterTime, searchQuery]);

  // Stats for filtered results
  const filteredStats = useMemo(() => {
    const completed = filteredRegistrations.filter(r => r.checked_in).length;
    const pending = filteredRegistrations.filter(r => !r.checked_in).length;
    const totalPeople = filteredRegistrations.reduce((sum, r) => sum + r.total_people, 0);
    
    return { completed, pending, total: filteredRegistrations.length, totalPeople };
  }, [filteredRegistrations]);

  // Filter batches
  const filteredBatches = useMemo(() => {
    return batches.filter(batch => {
      // Status filter
      if (filterStatus === 'completed' && !batch.checked_in) return false;
      if (filterStatus === 'pending' && batch.checked_in) return false;

      // Date filter
      if (filterDate !== 'all' && batch.slot_date !== filterDate) return false;

      // Time filter
      if (filterTime !== 'all' && batch.slot_time !== filterTime) return false;

      // Language filter
      if (filterLanguage !== 'all' && batch.language !== filterLanguage) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          batch.registration_number.toLowerCase().includes(query) ||
          batch.church_name.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [batches, filterStatus, filterDate, filterTime, filterLanguage, searchQuery]);

  // Stats for filtered batches
  const filteredBatchStats = useMemo(() => {
    const completed = filteredBatches.filter(b => b.checked_in).length;
    const pending = filteredBatches.filter(b => !b.checked_in).length;
    const totalPeople = filteredBatches.reduce((sum, b) => sum + b.people_count, 0);
    
    return { completed, pending, total: filteredBatches.length, totalPeople };
  }, [filteredBatches]);

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <div className="flex gap-2">
            <Link
              href="/admin/settings"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <button
              onClick={fetchStats}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
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

        {/* Batch/Registration View */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {viewMode === 'batches' ? 'Batch View' : 'Registration View'}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {viewMode === 'batches'
                    ? `(${filteredBatchStats.total} of ${batches.length} batches)`
                    : `(${filteredStats.total} of ${registrations.length} registrations)`
                  }
                </span>
              </h2>
              <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('batches')}
                  className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
                    viewMode === 'batches'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Batches
                </button>
                <button
                  onClick={() => setViewMode('registrations')}
                  className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
                    viewMode === 'registrations'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List className="w-4 h-4" />
                  Registrations
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  setLoading(true);
                  await Promise.all([
                    fetchRegistrations(),
                    fetchBatches(),
                    fetchStats(),
                  ]);
                  setLoading(false);
                }}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={() => {
                  if (viewMode === 'batches') {
                    setShowBatches(!showBatches);
                  } else {
                    setShowRegistrations(!showRegistrations);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <List className="w-4 h-4" />
                {(viewMode === 'batches' ? showBatches : showRegistrations) ? 'Hide' : 'Show'} List
              </button>
            </div>
          </div>

          {/* Filter Stats */}
          {(showRegistrations || showBatches) && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">Completed</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {viewMode === 'batches' ? filteredBatchStats.completed : filteredStats.completed}
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-900">Pending</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600">
                  {viewMode === 'batches' ? filteredBatchStats.pending : filteredStats.pending}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Total People</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {viewMode === 'batches' ? filteredBatchStats.totalPeople : filteredStats.totalPeople}
                </p>
              </div>
            </div>
          )}

          {/* Filters */}
          {(showRegistrations || showBatches) && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Filters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Name, Reg#, Church..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <select
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Dates</option>
                    {uniqueDates.map(date => (
                      <option key={date} value={date}>
                        {formatDate(date)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Slot
                  </label>
                  <select
                    value={filterTime}
                    onChange={(e) => setFilterTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Times</option>
                    {uniqueTimes.map(time => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              {(filterStatus !== 'all' || filterDate !== 'all' || filterTime !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterDate('all');
                    setFilterTime('all');
                    setSearchQuery('');
                  }}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Batch View Table */}
          {showBatches && viewMode === 'batches' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Batch #</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Church</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Language</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">People</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Reg #</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBatches.map((batch) => (
                    <tr key={`${batch.registration_id}-${batch.group_sequence}`} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {batch.checked_in ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">Completed</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-medium">Pending</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold">
                          {batch.group_sequence}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">{batch.church_name}</td>
                      <td className="py-3 px-4">{formatDate(batch.slot_date)}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-blue-600">{formatTime(batch.slot_time)}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${
                          batch.language === 'tamil'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {batch.language}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold">{batch.people_count}</td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-600">{batch.registration_number}</td>
                    </tr>
                  ))}
                  {filteredBatches.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500">
                        {batches.length === 0 ? 'No batches found' : 'No batches match the selected filters'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Registration View Table */}
          {showRegistrations && viewMode === 'registrations' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
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
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {reg.checked_in ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">Done</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-medium">Pending</span>
                          </div>
                        )}
                      </td>
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
                  {filteredRegistrations.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500">
                        {registrations.length === 0 ? 'No registrations found' : 'No registrations match the selected filters'}
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
