import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

function Reports() {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, paid
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0], // Last 30 days
    end: new Date().toISOString().split('T')[0]
  });
  const [summary, setSummary] = useState({
    totalRecords: 0,
    totalRevenue: 0,
    paidRevenue: 0,
    pendingRevenue: 0,
    averageDuration: 0,
    occupancyRate: 0,
    pendingPayments: 0
  });

  useEffect(() => {
    fetchRecords();
  }, [filter, dateRange]);

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      // Fetch parking records
      const recordsResponse = await api.get('/api/parking-records');
      let filteredRecords = recordsResponse.data;

      // Apply date filter
      filteredRecords = filteredRecords.filter(record => {
        const recordDate = new Date(record.EntryTime).toISOString().split('T')[0];
        return recordDate >= dateRange.start && recordDate <= dateRange.end;
      });

      // Apply payment status filter
      if (filter !== 'all') {
        filteredRecords = filteredRecords.filter(record => 
          filter === 'paid' ? record.PaymentStatus === 'Paid' : record.PaymentStatus === 'Pending'
        );
      }

      setRecords(filteredRecords);

      // Calculate summary statistics
      const paidRevenue = filteredRecords
        .filter(record => record.PaymentStatus === 'Paid' && record.Amount)
        .reduce((total, record) => total + Number(record.Amount), 0);

      // Calculate current costs for active (pending) records
      const pendingRevenue = filteredRecords
        .filter(record => record.PaymentStatus === 'Pending')
        .reduce((total, record) => {
          const duration = record.Duration || calculateDuration(record.EntryTime);
          const cost = calculateCost(duration);
          return total + (cost || 0);
        }, 0);

      const totalRevenue = (paidRevenue || 0) + (pendingRevenue || 0);

      const totalDuration = filteredRecords
        .filter(record => record.Duration || record.EntryTime)
        .reduce((total, record) => {
          if (record.Duration) {
            return total + Number(record.Duration);
          } else {
            return total + calculateDuration(record.EntryTime);
          }
        }, 0);

      const averageDuration = filteredRecords.length > 0 
        ? Math.round(totalDuration / filteredRecords.length) 
        : 0;

      const pendingPayments = filteredRecords
        .filter(record => record.PaymentStatus === 'Pending')
        .length;

      // Calculate occupancy rate
      const totalSlots = await api.get('/api/parking-slots');
      const occupiedSlots = totalSlots.data.filter(slot => slot.Status === 'Occupied').length;
      const occupancyRate = Math.round((occupiedSlots / totalSlots.data.length) * 100);

      setSummary({
        totalRecords: filteredRecords.length,
        totalRevenue: totalRevenue || 0,
        paidRevenue: paidRevenue || 0,
        pendingRevenue: pendingRevenue || 0,
        averageDuration,
        occupancyRate,
        pendingPayments
      });

      setError(null);
    } catch (err) {
      setError('Failed to fetch parking records');
      console.error('Error fetching records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDuration = (entryTime) => {
    const entry = new Date(entryTime);
    const now = new Date();
    return Math.round((now - entry) / (1000 * 60)); // Duration in minutes
  };

  const calculateCost = (duration) => {
    const hours = Math.ceil(duration / 60); // Round up to nearest hour
    return hours * 500; // 500 RWF per hour
  };

  const formatCurrency = (amount) => {
    // Handle null, undefined, or NaN values
    if (!amount || isNaN(amount)) {
      return "0";
    }
    // Round to whole number and format with commas
    return Math.round(amount)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Parking Reports</h1>
          <p className="text-gray-600">Comprehensive parking facility analytics and statistics</p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Records</option>
              <option value="pending">Pending Payments</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Records</h3>
          <p className="text-2xl font-bold text-gray-800">{summary.totalRecords}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(summary.totalRevenue)} RWF
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600">
              Paid: <span className="font-medium text-green-600">{formatCurrency(summary.paidRevenue)} RWF</span>
            </p>
            <p className="text-sm text-gray-600">
              Pending: <span className="font-medium text-yellow-600">{formatCurrency(summary.pendingRevenue)} RWF</span>
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Average Duration</h3>
          <p className="text-2xl font-bold text-gray-800">{formatDuration(summary.averageDuration)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Occupancy Rate</h3>
          <p className="text-2xl font-bold text-blue-600">{summary.occupancyRate}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Pending Payments</h3>
          <p className="text-2xl font-bold text-yellow-600">{summary.pendingPayments}</p>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Detailed Records</h2>
          <Link 
            to="/parking-records" 
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            View All Records →
          </Link>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-red-500">
              {error}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plate Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entry Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exit Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.PlateNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.DriverName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(record.EntryTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(record.ExitTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDuration(record.Duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.Amount ? `${formatCurrency(record.Amount)} RWF` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${record.PaymentStatus === 'Paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'}`}
                      >
                        {record.PaymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No records found for the selected filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;