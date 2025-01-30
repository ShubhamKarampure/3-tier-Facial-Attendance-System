import React from 'react';

const Header = () => {
  return (
    <div className="relative py-6">
      
      {/* Main title */}
      <div className="relative">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-transparent bg-clip-text">
          Facial Attendance System
        </h1>
        
        {/* Subtitle */}
        <p className="text-center text-gray-500 text-sm md:text-base">
          Using 3-Tier Architecture
        </p>
      </div>
      
      {/* Underline decoration */}
      <div className="flex justify-center mt-4">
        <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full" />
      </div>
    </div>
  );
};

export default Header;