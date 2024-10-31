// src/components/VehicleCountDisplay.js
import React from "react";

const VehicleCountDisplay = ({ vehicleCounts, totalCounts, accessTime, currentTime, onSendData }) => {
  const formatTime = (date) => {
    return date
      ? `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
      : "";
  };

  return (
    <div className="flex flex-row gap-4 p-4 mt-10">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-2xl font-semibold mb-4">Masuk Simpang :</h2>
        <p className="text-lg">Mobil: {vehicleCounts.carsCrossedIn}</p>
        <p className="text-lg">Motor: {vehicleCounts.motorcyclesCrossedIn}</p>
        <p className="text-lg">Truk: {vehicleCounts.trucksCrossedIn}</p>
        <p className="text-lg">Bus: {vehicleCounts.busesCrossedIn}</p>
        <p className="text-lg">Orang: {vehicleCounts.pedestriansCrossedIn}</p>
        <h3 className="text-xl font-bold mt-4">
          Total Kendaraan Masuk: {totalCounts.totalCrossedIn}
        </h3>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-2xl font-semibold mb-4">Keluar Simpang :</h2>
        <p className="text-lg">Mobil: {vehicleCounts.carsCrossedOut}</p>
        <p className="text-lg">Motor: {vehicleCounts.motorcyclesCrossedOut}</p>
        <p className="text-lg">Truk: {vehicleCounts.trucksCrossedOut}</p>
        <p className="text-lg">Bus: {vehicleCounts.busesCrossedOut}</p>
        <p className="text-lg">Orang: {vehicleCounts.pedestriansCrossedOut}</p>
        <h3 className="text-xl font-bold mt-4">
          Total Kendaraan Keluar: {totalCounts.totalCrossedOut}
        </h3>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="time mb-4">
          <p className="text-sm text-gray-600">Waktu akses halaman: {formatTime(accessTime)}</p>
          <p className="text-sm text-gray-600">Waktu sekarang: {formatTime(currentTime)}</p>
        </div>
        <button
          onClick={onSendData}
          className="w-full bg-customRed text-white hover:text-white px-4 py-2 rounded-lg border-none hover:bg-red-950"
        >
          Send Data to Backend
        </button>
      </div>
    </div>
  );
};

export default VehicleCountDisplay;
