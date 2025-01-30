import React from 'react';
import { Camera } from 'lucide-react';

const RegistrationForm = ({ registrationData, setRegistrationData, setShowCamera }) => {
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Student Registration</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={registrationData.name}
            onChange={(e) => setRegistrationData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Roll Number
          </label>
          <input
            type="text"
            value={registrationData.rollNumber}
            onChange={(e) => setRegistrationData(prev => ({ ...prev, rollNumber: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            required
          />
        </div>
        <button
          onClick={() => {
            if (registrationData.name && registrationData.rollNumber) {
              setShowCamera(true);
            }
          }}
          disabled={!registrationData.name || !registrationData.rollNumber}
          className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Camera size={20} />
          Proceed to Face Capture
        </button>
      </div>
    </div>
  );
};

export default RegistrationForm;