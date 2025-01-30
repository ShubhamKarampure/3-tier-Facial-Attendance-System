import React from 'react';
import { UserCheck, UserPlus } from 'lucide-react';

const ModeSelector = ({ mode, setMode, resetForm }) => {
  const handleModeChange = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="flex justify-center mb-8">
      <div className="bg-gray-100 p-1 rounded-xl relative">
        {/* Background Pill */}
        <div
          className={`absolute inset-y-1 w-1/2 transition-all duration-300 ease-out 
            ${mode === 'register' ? 'translate-x-full' : 'translate-x-0'}
            bg-white rounded-lg shadow-lg`}
        />
        
        {/* Buttons Container */}
        <div className="relative flex">
          <button
            onClick={() => handleModeChange('attendance')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300
              ${mode === 'attendance' 
                ? 'text-blue-600 scale-105' 
                : 'text-gray-500 hover:text-gray-700'}`}
          >
            <UserCheck 
              className={`transition-transform duration-300 ${mode === 'attendance' ? 'scale-110' : ''}`}
              size={20} 
            />
            <span className="font-medium">Mark Attendance</span>
          </button>
          
          <button
            onClick={() => handleModeChange('register')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300
              ${mode === 'register' 
                ? 'text-blue-600 scale-105' 
                : 'text-gray-500 hover:text-gray-700'}`}
          >
            <UserPlus 
              className={`transition-transform duration-300 ${mode === 'register' ? 'scale-110' : ''}`}
              size={20} 
            />
            <span className="font-medium">Register Face</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeSelector;