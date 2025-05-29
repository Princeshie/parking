import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Dashboard() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [stats, setStats] = useState({
    available: 0,
    occupied: 0,
    total: 0,
    totalRevenue: 0,
    todayEntries: 0
  });
  const [recentRecords, setRecentRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch parking slots
        const slotsResponse = await api.get('/api/parking-slots');
        setSlots(slotsResponse.data);
        
        // Calculate parking statistics
        const available = slotsResponse.data.filter(slot => slot.Status === 'Available').length;
        
        // Fetch today's reports
        const today = new Date().toISOString().split('T')[0];
        const reportsResponse = await api.get('/api/reports', {
          params: {
            startDate: today,
            endDate: today
          }
        });

        // Fetch recent parking records
        const recordsResponse = await api.get('/api/parking-records');
        setRecentRecords(recordsResponse.data.slice(0, 5)); // Get only the 5 most recent records

        setStats({
          available,
          occupied: slotsResponse.data.length - available,
          total: slotsResponse.data.length,
          totalRevenue: reportsResponse.data
            .filter(record => record.PaymentStatus === 'Paid')
            .reduce((total, record) => total + (record.Amount || 0), 0),
          todayEntries: reportsResponse.data.length
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('user');
    // Redirect to login page
    window.location.href = '/login';
  };

  const getStatusColor = (status) => {
    return status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getPaymentStatusColor = (status) => {
    return status === 'Paid' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                Parking Management
              </h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg 
                  className="mr-2 -ml-1 h-5 w-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Dashboard Overview
          </h2>
          <p className="text-gray-600">
            Monitor and manage your parking facility in real-time
          </p>
        </div>

        {/* Quick Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-gray-600 text-sm">Available Slots</h2>
                <p className="text-2xl font-bold text-gray-800">{stats.available}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="rounded-full bg-red-100 p-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-gray-600 text-sm">Occupied Slots</h2>
                <p className="text-2xl font-bold text-gray-800">{stats.occupied}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-gray-600 text-sm">Total Capacity</h2>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reports and Records Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Reports Quick Access */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Today's Overview</h2>
              <Link 
                to="/reports" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Full Reports →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Today's Entries</p>
                <p className="text-2xl font-bold text-gray-800">{stats.todayEntries}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalRevenue.toLocaleString()} RWF
                </p>
              </div>
            </div>
          </div>

          {/* Recent Parking Records */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Recent Parking Records</h2>
              <Link 
                to="/parking-records" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All Records →
              </Link>
            </div>
            <div className="space-y-3">
              {recentRecords.map((record) => (
                <div 
                  key={record.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{record.PlateNumber}</p>
                    <p className="text-sm text-gray-600">{formatDateTime(record.EntryTime)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Slot {record.SlotNumber}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(record.PaymentStatus)}`}>
                      {record.PaymentStatus}
                    </span>
                  </div>
                </div>
              ))}
              {recentRecords.length === 0 && (
                <p className="text-center text-gray-500 py-4">No recent records</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Link 
                to="/reports" 
                className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-purple-600 font-medium">View Reports</span>
              </Link>
              <Link 
                to="/parking-records" 
                className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span className="text-blue-600 font-medium">View Records</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link 
            to="/car-entry" 
            className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Car Entry
          </Link>
          <Link 
            to="/car-exit" 
            className="flex items-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Car Exit
          </Link>
          <Link 
            to="/reports" 
            className="flex items-center px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Reports
          </Link>
        </div>

        {/* Parking Slots Grid */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Parking Slots Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {slots.map((slot) => (
              <div 
                key={slot.SlotNumber} 
                className={`rounded-lg p-4 border transition-all duration-200 hover:shadow-md
                  ${slot.Status === 'Available' 
                    ? 'border-green-200 bg-green-50 hover:border-green-300' 
                    : 'border-red-200 bg-red-50 hover:border-red-300'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">
                    {slot.SlotNumber}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(slot.Status)}`}>
                    {slot.Status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;