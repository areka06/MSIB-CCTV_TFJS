import React from "react";

const TimeDisplay = ({ accessTime, currentTime }) => {
  const formatTime = (date) => {
    return date
      ? `${date.getDate()}/${
          date.getMonth() + 1
        }/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
      : "";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="time mb-4">
        <p className="text-sm text-gray-600">
          Waktu akses halaman: {formatTime(accessTime)}
        </p>
        <p className="text-sm text-gray-600">
          Waktu sekarang: {formatTime(currentTime)}
        </p>
      </div>
    </div>
  );
};

export default TimeDisplay;