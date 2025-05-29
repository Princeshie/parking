import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function CarExit() {
  const navigate = useNavigate();
  const [plateNumber, setPlateNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exitDetails, setExitDetails] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/car-exit', {
        plateNumber,
        exitTime: new Date().toISOString()
      });
      setExitDetails(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process car exit');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      await api.post('/api/record-payment', {
        plateNumber,
        amount: exitDetails.amount,
        paymentDate: new Date().toISOString()
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Car Exit</h1>
            <p className="text-gray-600">Process vehicle exit and payment</p>
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

        {/* Car Exit Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Plate Number
              </label>
              <input
                type="text"
                id="plateNumber"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter plate number"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:bg-blue-300"
            >
              {loading ? 'Processing...' : 'Process Exit'}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Exit Details */}
        {exitDetails && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Parking Fee Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-lg font-medium text-gray-800">
                    {formatDuration(exitDetails.duration)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hours Charged</p>
                  <p className="text-lg font-medium text-gray-800">
                    {exitDetails.hours} hour(s)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rate per Hour</p>
                  <p className="text-lg font-medium text-gray-800">
                    {exitDetails.hourlyRate} RWF
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl font-bold text-green-600">
                    {exitDetails.amount.toLocaleString()} RWF
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  {exitDetails.message}
                </p>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200 disabled:bg-green-300"
              >
                {loading ? 'Processing Payment...' : 'Process Payment'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CarExit;