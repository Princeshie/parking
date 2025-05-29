import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function CarEntry() {
  const [plateNumber, setPlateNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [slotNumber, setSlotNumber] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:3000/api/car-entry', {
        plateNumber,
        driverName,
        phoneNumber,
        slotNumber,
        entryTime: new Date().toISOString(),
      });
      alert('Car entry recorded!');
      navigate('/dashboard');
    } catch (err) {
      alert('Error recording car entry');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Car Entry</h1>
            <p className="text-gray-600">Register a new vehicle entry</p>
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

        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <input
            type="text"
            placeholder="Plate Number"
            className="w-full p-2 mb-4 border rounded"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
          />
          <input
            type="text"
            placeholder="Driver Name"
            className="w-full p-2 mb-4 border rounded"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Phone Number"
            className="w-full p-2 mb-4 border rounded"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <input
            type="text"
            placeholder="Slot Number (e.g., A1)"
            className="w-full p-2 mb-4 border rounded"
            value={slotNumber}
            onChange={(e) => setSlotNumber(e.target.value)}
          />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
            onClick={handleSubmit}
          >
            Record Entry
          </button>
        </div>
      </div>
    </div>
  );
}

export default CarEntry;