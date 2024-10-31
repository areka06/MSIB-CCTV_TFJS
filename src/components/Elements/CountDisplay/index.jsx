import React from "react";

const CountDisplay = ({ counts, totals }) => {
  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-2xl font-semibold mb-4">Masuk Simpang :</h2>
        <p className="text-lg">Mobil: {counts.carsCrossedIn}</p>
        <p className="text-lg">Motor: {counts.motorcyclesCrossedIn}</p>
        <p className="text-lg">Truk: {counts.trucksCrossedIn}</p>
        <p className="text-lg">Bus: {counts.busesCrossedIn}</p>
        <p className="text-lg">Orang: {counts.pedestriansCrossedIn}</p>
        <h3 className="text-xl font-bold mt-4">
          Total Kendaraan Masuk: {totals.totalCrossedIn}
        </h3>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-2xl font-semibold mb-4">Keluar Simpang :</h2>
        <p className="text-lg">Mobil: {counts.carsCrossedOut}</p>
        <p className="text-lg">Motor: {counts.motorcyclesCrossedOut}</p>
        <p className="text-lg">Truk: {counts.trucksCrossedOut}</p>
        <p className="text-lg">Bus: {counts.busesCrossedOut}</p>
        <p className="text-lg">Orang: {counts.pedestriansCrossedOut}</p>
        <h3 className="text-xl font-bold mt-4">
          Total Kendaraan Keluar: {totals.totalCrossedOut}
        </h3>
      </div>
    </>
  );
};

export default CountDisplay;