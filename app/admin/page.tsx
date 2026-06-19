'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Users, Calendar, TrendingUp, Clock, RefreshCw, Trash2, List, Filter, CheckCircle, XCircle, Layers, Settings, Check, Download, FileText } from 'lucide-react';

interface DateBreakdown {
  slot_date: string;
  day_type: string;
  total_capacity: number;
  filled_capacity: number;
  registered_people: number;
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

interface VisitorStats {
  visitor_type: string;
  total_visitors: number;
  percentage: number;
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
  const [visitorStats, setVisitorStats] = useState<VisitorStats[]>([]);
  const [dateBreakdown, setDateBreakdown] = useState<DateBreakdown[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegistrations, setShowRegistrations] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [pendingCheckIn, setPendingCheckIn] = useState<{regNumber: string, type: 'registration'} | null>(null);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
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
        setVisitorStats(data.visitorStats || []);
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
      const response = await fetch(`/api/admin/registrations?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
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

  const handleCheckIn = async (regNumber: string) => {
    // If no password stored, prompt for it
    if (!adminPassword) {
      setPendingCheckIn({ regNumber, type: 'registration' });
      setShowPasswordPrompt(true);
      return;
    }

    // Proceed with check-in
    await performCheckIn(regNumber);
  };

  const performCheckIn = async (regNumber: string) => {
    setCheckingIn(regNumber);
    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registration_number: regNumber,
          admin_password: adminPassword,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Longer delay to ensure database is updated
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Refresh data multiple times to ensure update
        await Promise.all([
          fetchRegistrations(),
          fetchStats(),
        ]);
        
        // Second refresh after another delay
        await new Promise(resolve => setTimeout(resolve, 500));
        await Promise.all([
          fetchRegistrations(),
          fetchStats(),
        ]);
        
        // Then show message
        if (data.alreadyCheckedIn) {
          alert(`Already checked in at ${new Date(data.registration.checkedInAt).toLocaleString()}\n\nPage will reload to show updated status.`);
        } else {
          alert('Check-in successful!\n\nPage will reload to show updated status.');
        }
        
        // Force page reload to clear any caching
        window.location.reload();
      } else {
        alert(`Check-in failed: ${data.error}`);
        // If unauthorized, clear password
        if (response.status === 401) {
          setAdminPassword('');
          setShowPasswordPrompt(true);
        }
      }
    } catch (error) {
      console.error('Error during check-in:', error);
      alert('Error during check-in');
    } finally {
      setCheckingIn(null);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!adminPassword.trim()) {
      alert('Please enter admin password');
      return;
    }

    setShowPasswordPrompt(false);
    
    if (pendingCheckIn) {
      await performCheckIn(pendingCheckIn.regNumber);
      setPendingCheckIn(null);
    }
  };

  const downloadReport = () => {
    const reportContent = `
BIBLE EXHIBITION 2026 - FINAL REPORT
Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
================================================================================

REGISTRATION STATISTICS
================================================================================
Total Registrations via URL: 4,960
Total Registrations via QR Code: 104

REGISTRATION BY COUNTRY
--------------------------------------------------------------------------------
1. India                                                                    103
2. United Kingdom                                                             1

REGISTRATION BY CITY (Top 26)
--------------------------------------------------------------------------------
 1. Bengaluru                                                                41
 2. Mangaluru                                                                11
 3. Navi Mumbai (Ghansoli)                                                    7
 4. Chennai                                                                   5
 5. Yelahanka                                                                 4
 6. Koppana Agrahara                                                          3
 7. S.A.S Nagar                                                               3
 8. Belvata                                                                   3
 9. Hubballi                                                                  2
10. New Delhi (Block N)                                                       2
11. Tālīkota                                                                  2
12. Dommasandra                                                               2
13. Tiptūr                                                                    2
14. Navi Mumbai (Reliance Corporate Park)                                     2
15. Belagavi                                                                  2
16. Hunasamaranahalli                                                         2
17. Electronic City Phase I                                                   2
18. Tamarakutamkudiyiruppu                                                    1
19. Ballari                                                                   1
20. Kanakapura                                                                1
21. Gurugram                                                                  1
22. Mutge                                                                     1
23. Cherpulassery                                                             1
24. Patna (Police Colony)                                                     1
25. New Delhi (Jasola)                                                        1
26. London                                                                    1

VISITOR STATISTICS (Till Friday)
================================================================================
Total Visitors:                                                           2,824
  - Adventist (including school):                                        2,655
  - Non-Adventist & Non-believers:                                          169

VISITOR BREAKDOWN
--------------------------------------------------------------------------------
Adventist Percentage:                                                    94.0%
Non-Adventist Percentage:                                                 6.0%

================================================================================
Report End
================================================================================
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bible_Exhibition_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  // Get unique dates for filters
  const uniqueDates = useMemo(() => {
    const dates = new Set(registrations.map(r => r.preferred_date));
    return Array.from(dates).sort();
  }, [registrations]);

  // Filter registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      // Status filter
      if (filterStatus === 'completed' && !reg.checked_in) return false;
      if (filterStatus === 'pending' && reg.checked_in) return false;

      // Date filter
      if (filterDate !== 'all' && reg.preferred_date !== filterDate) return false;

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
  }, [registrations, filterStatus, filterDate, searchQuery]);

  // Stats for filtered results
  const filteredStats = useMemo(() => {
    const completed = filteredRegistrations.filter(r => r.checked_in).length;
    const pending = filteredRegistrations.filter(r => !r.checked_in).length;
    const totalPeople = filteredRegistrations.reduce((sum, r) => sum + r.total_people, 0);
    
    return { completed, pending, total: filteredRegistrations.length, totalPeople };
  }, [filteredRegistrations]);

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

        {/* Exhibition Report */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Exhibition Report
              </h2>
            </div>
            <button
              onClick={downloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>

          {/* Registration Statistics */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              Registration Statistics
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-sm text-gray-600 mb-2">Total Registrations via URL</p>
                <p className="text-4xl font-bold text-blue-600">4,960</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <p className="text-sm text-gray-600 mb-2">Total Registrations via QR Code</p>
                <p className="text-4xl font-bold text-purple-600">104</p>
              </div>
            </div>
          </div>

          {/* Registration by Country */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-green-500 pb-2">
              Registration by Country
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">🇮🇳 India</span>
                <span className="text-2xl font-bold text-green-600">103</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">🇬🇧 United Kingdom</span>
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
            </div>
          </div>

          {/* Registration by City */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-orange-500 pb-2">
              Registration by City (Top 26)
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {[
                { city: 'Bengaluru', count: 41 },
                { city: 'Mangaluru', count: 11 },
                { city: 'Navi Mumbai (Ghansoli)', count: 7 },
                { city: 'Chennai', count: 5 },
                { city: 'Yelahanka', count: 4 },
                { city: 'Koppana Agrahara', count: 3 },
                { city: 'S.A.S Nagar', count: 3 },
                { city: 'Belvata', count: 3 },
                { city: 'Hubballi', count: 2 },
                { city: 'New Delhi (Block N)', count: 2 },
                { city: 'Tālīkota', count: 2 },
                { city: 'Dommasandra', count: 2 },
                { city: 'Tiptūr', count: 2 },
                { city: 'Navi Mumbai (Reliance Corporate Park)', count: 2 },
                { city: 'Belagavi', count: 2 },
                { city: 'Hunasamaranahalli', count: 2 },
                { city: 'Electronic City Phase I', count: 2 },
                { city: 'Tamarakutamkudiyiruppu', count: 1 },
                { city: 'Ballari', count: 1 },
                { city: 'Kanakapura', count: 1 },
                { city: 'Gurugram', count: 1 },
                { city: 'Mutge', count: 1 },
                { city: 'Cherpulassery', count: 1 },
                { city: 'Patna (Police Colony)', count: 1 },
                { city: 'New Delhi (Jasola)', count: 1 },
                { city: 'London', count: 1 },
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium text-gray-700">{index + 1}. {item.city}</span>
                  <span className="text-lg font-bold text-orange-600">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visitor Statistics */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-purple-500 pb-2">
              Visitor Statistics
            </h3>
            <div className="grid md:grid-cols-3 gap-6 mb-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <p className="text-sm text-gray-600 mb-2">Total Visitors</p>
                <p className="text-4xl font-bold text-purple-600">
                  {stats.totalPeople.toLocaleString()}
                </p>
              </div>
              {visitorStats.map((stat, index) => (
                <div
                  key={stat.visitor_type}
                  className={`${
                    stat.visitor_type === 'adventist'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-yellow-50 border-yellow-200'
                  } border rounded-lg p-6`}
                >
                  <p className="text-sm text-gray-600 mb-2">
                    {stat.visitor_type === 'adventist'
                      ? 'Adventist (incl. school)'
                      : 'Non-Adventist & Non-believers'}
                  </p>
                  <p className={`text-4xl font-bold ${
                    stat.visitor_type === 'adventist' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {stat.total_visitors.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stat.percentage}%</p>
                </div>
              ))}
            </div>
            
            {/* Visitor Breakdown Chart */}
            {visitorStats.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Visitor Breakdown</p>
                <div className="flex gap-2">
                  {visitorStats.map((stat, index) => (
                    <div
                      key={stat.visitor_type}
                      style={{ width: `${stat.percentage}%` }}
                    >
                      <div className={`w-full ${
                        stat.visitor_type === 'adventist' ? 'bg-green-500' : 'bg-yellow-500'
                      } rounded-full h-8 flex items-center justify-center text-white text-sm font-bold`}>
                        {stat.percentage >= 10 && (
                          <span>
                            {stat.visitor_type === 'adventist' ? 'Adventist' : 'Non-Adventist'} {stat.percentage}%
                          </span>
                        )}
                        {stat.percentage < 10 && stat.percentage >= 5 && (
                          <span>{stat.percentage}%</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Registration View */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Registration View
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredStats.total} of {registrations.length} registrations)
              </span>
            </h2>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  setLoading(true);
                  await Promise.all([
                    fetchRegistrations(),
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
                onClick={() => setShowRegistrations(!showRegistrations)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <List className="w-4 h-4" />
                {showRegistrations ? 'Hide' : 'Show'} List
              </button>
            </div>
          </div>

          {/* Filter Stats */}
          {showRegistrations && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">Completed</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {filteredStats.completed}
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-900">Pending</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredStats.pending}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Total People</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredStats.totalPeople}
                </p>
              </div>
            </div>
          )}

          {/* Filters */}
          {showRegistrations && (
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

              </div>

              {/* Clear Filters */}
              {(filterStatus !== 'all' || filterDate !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterDate('all');
                    setSearchQuery('');
                  }}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Registration View Table */}
          {showRegistrations && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Reg #</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
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
                          <button
                            onClick={() => handleCheckIn(reg.registration_number)}
                            disabled={checkingIn === reg.registration_number}
                            className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 disabled:opacity-50 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            <span className="text-xs font-medium">
                              {checkingIn === reg.registration_number ? 'Checking...' : 'Mark Done'}
                            </span>
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">{reg.registration_number}</td>
                      <td className="py-3 px-4">{reg.name}</td>
                      <td className="py-3 px-4">
                        <a href={`tel:${reg.phone}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                          {reg.phone || 'N/A'}
                        </a>
                      </td>
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
                        <div className="flex gap-2 justify-center">
                          {!reg.checked_in && (
                            <button
                              onClick={() => handleCheckIn(reg.registration_number)}
                              disabled={checkingIn === reg.registration_number}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors text-sm"
                            >
                              <Check className="w-3 h-3" />
                              {checkingIn === reg.registration_number ? 'Checking...' : 'Check In'}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(reg.id, reg.registration_number)}
                            disabled={deleting === reg.id}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 transition-colors text-sm"
                          >
                            <Trash2 className="w-3 h-3" />
                            {deleting === reg.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredRegistrations.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-gray-500">
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
              <h3 className="font-semibold text-gray-900">Saturdays & Sundays</h3>
              <p className="text-gray-600">
                Full Day Sessions: 9 AM - 8 PM (660 capacity/day)
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

        {/* Password Prompt Modal */}
        {showPasswordPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Admin Authentication</h3>
              <p className="text-gray-600 mb-4">
                Enter admin password to perform check-in operations
              </p>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="Admin Password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={handlePasswordSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit
                </button>
                <button
                  onClick={() => {
                    setShowPasswordPrompt(false);
                    setPendingCheckIn(null);
                    setAdminPassword('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Made with Bob
