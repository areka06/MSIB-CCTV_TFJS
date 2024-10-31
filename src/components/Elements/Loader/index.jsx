import React from 'react';

const Loader = ({ progress }) => {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-75">
      <div className="text-center">
        <div className="loader-circle border-4 border-t-4 border-t-customRed border-gray-200 rounded-full w-16 h-16 animate-spin mb-4"></div>
        <p className="text-white text-lg font-semibold">Loading model... {progress}%</p>
      </div>
    </div>
  );
};

export default Loader;
