import React, { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs"; 
import "@tensorflow/tfjs-backend-webgl";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { Camera, Cctv, User, Bike, Car, Truck, Bus, X } from "lucide-react";
import { detect, detectVideo } from "/src/utils/detect.js";

const vehicleTypes = [
  { icon: User, label: "Orang" },
  { icon: Bike, label: "Motor" },
  { icon: Car, label: "Mobil" },
  { icon: Truck, label: "Truk" },
  { icon: Bus, label: "Bus" },
];

const VehicleCounter = ({ icon: Icon, count, label }) => (
  <div className="flex items-center space-x-1 bg-white rounded-md p-1">
    <Icon className="text-sm text-red-600 w-4 h-4" />
    <div>
      <p className="font-bold text-red-600 text-xs">{count}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  </div>
);

const DirectionIcon = ({ direction }) => (
  <svg
    className={`w-4 h-4 text-red-600 ${direction === "out" ? "transform rotate-180" : ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const CCTVCard = ({ title, videoSrc, isCountingStarted, elapsedTime }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const playerRef = useRef(null);

  const [vehicleCounts, setVehicleCounts] = useState({ in: {}, out: {} });
  const [totalCounts, setTotalCounts] = useState({ totalCrossedIn: 0, totalCrossedOut: 0 });
  const modelName = "yolov8n";

  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      const yolov8 = await tf.loadGraphModel(`/${modelName}_web_model/model.json`);
      const dummyInput = tf.ones(yolov8.inputs[0].shape);
      yolov8.execute(dummyInput);
      tf.dispose([dummyInput]);
    };

    loadModel();
  }, []);

  useEffect(() => {
    const player = videojs(videoRef.current, {
      techOrder: ["html5"],
      sources: [{ src: videoSrc, type: "application/x-mpegURL" }],
      controls: false,
    });

    playerRef.current = player;

    player.on("loadedmetadata", () => {
      player.getChild("controlBar").hide();
    });

    player.on("canplay", () => {
      if (videoRef.current && canvasRef.current) {
        detectVideo(videoRef.current, modelName, canvasRef.current, updateObjectCounts);
      }
    });

    return () => {
      player.dispose();
    };
  }, [videoSrc]);

  useEffect(() => {
    let interval;
    if (isCountingStarted) {
      interval = setInterval(() => {
        setVehicleCounts(prevCounts => {
          const newCounts = { in: { ...prevCounts.in }, out: { ...prevCounts.out } };
          vehicleTypes.forEach(vehicle => {
            newCounts.in[vehicle.label] = (newCounts.in[vehicle.label] || 0) + Math.floor(Math.random() * 3);
            newCounts.out[vehicle.label] = (newCounts.out[vehicle.label] || 0) + Math.floor(Math.random() * 3);
          });
          return newCounts;
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isCountingStarted]);

  useEffect(() => {
    const totalIn = Object.values(vehicleCounts.in).reduce((sum, count) => sum + count, 0);
    const totalOut = Object.values(vehicleCounts.out).reduce((sum, count) => sum + count, 0);
    setTotalCounts({ totalCrossedIn: totalIn, totalCrossedOut: totalOut });
  }, [vehicleCounts]);

  return (
    <div className="bg-white mb-4 rounded-lg shadow transition-transform duration-500">
      <div className="p-2 flex justify-between items-center">
        <h2 className="text-sm font-bold text-red-600">{title}</h2>
        <div className="text-sm text-red-600">Time: {elapsedTime}s</div>
      </div>
      <div className="relative w-full h-64">
        <video ref={videoRef} className="video-js w-full h-full object-cover" autoPlay muted />
      </div>

      {["in", "out"].map((direction) => (
        <div key={direction} className="mb-2 p-2">
          <div className="flex items-center mb-1">
            <DirectionIcon direction={direction} />
            <p className="font-semibold text-red-600 ml-1 text-xs">{direction === "in" ? "Masuk" : "Keluar"}</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
            {vehicleTypes.map((vehicle) => (
              <VehicleCounter
                key={vehicle.label}
                icon={vehicle.icon}
                count={vehicleCounts[direction][vehicle.label] || 0}
                label={vehicle.label}
              />
            ))}
            <div className="flex items-center justify-between bg-red-600 text-white rounded-md p-1 col-span-3 sm:col-span-1">
              <span className="text-xs">Total</span>
              <span className="font-bold text-xs">
                {direction === "in" ? totalCounts.totalCrossedIn : totalCounts.totalCrossedOut}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const SendDataModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Send Data to Backend</h2>
        <p className="mb-10 text-gray-800">Are you sure you want to send the collected data to the backend?</p>
        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={onConfirm}
          >
            Send Data
          </button>
        </div>
      </div>
    </div>
  );
};

const DynamicCCTVCounter = () => {
  const [selectedArea, setSelectedArea] = useState("Perbatasan Kota");
  const [cctvData, setCctvData] = useState([]);
  const [error, setError] = useState(null);
  const [isCountingStarted, setIsCountingStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://10.7.183.95:3013/devices");
        const result = await response.json();

        if (result.data) {
          setCctvData(result.data);
        } else {
          setError("Data tidak ditemukan");
        }
      } catch (error) {
        setError("Terjadi kesalahan saat mengambil data");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (isCountingStarted) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isCountingStarted]);

  const filteredCctv = cctvData.filter(cctv => cctv.category === selectedArea);

  const handleStartCounting = () => {
    setIsCountingStarted(true);
    setElapsedTime(0);
  };

  const handleStopCounting = () => {
    setIsCountingStarted(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSendData = async () => {
    // Implement your logic to send data to the backend here
    console.log("Sending data to backend...");
    // Example:
    // try {
    //   const response = await fetch('your-backend-url', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ /* your data here */ }),
    //   });
    //   const result = await response.json();
    //   console.log(result);
    // } catch (error) {
    //   console.error("Error sending data:", error);
    // }
    setIsModalOpen(false);
  };

  return (
    <div id="CountingSection" className="mt-16 min-h-screen bg-white p-4 text-white">
      <h1 className="text-4xl text-red-500 font-bold text-center mb-6">CCTV Mana Yang Ingin Anda Hitung?</h1>
      
      <div className="flex flex-wrap gap-3 justify-center p-4">
  {["Perbatasan Kota", "Dalam Kota", "Perbatasan Provinsi"].map(area => (
    <button
      key={area}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg
        transition-all duration-300 ease-in-out
        ${selectedArea === area 
          ? 'bg-red-500 text-white shadow-md' 
          : 'bg-white shadow-sm border border-gray-100 hover:bg-red-50 hover:border-red-100'
        }
      `}
      onClick={() => setSelectedArea(area)}
    >
      <Cctv 
        className={`w-4 h-4 ${
          selectedArea === area 
            ? 'text-white' 
            : 'text-red-400 group-hover:text-red-500'
        }`}
      />
      <span className={`
        text-sm font-medium
        ${selectedArea === area 
          ? 'text-white' 
          : 'text-gray-700 group-hover:text-red-500'
        }
      `}>
        {area}
      </span>
    </button>
  ))}
</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 transition-opacity duration-500">
        {filteredCctv.map((cctv) => (
          <CCTVCard 
            key={cctv.id} 
            title={cctv.location} 
            videoSrc={cctv.link}
            isCountingStarted={isCountingStarted}
            elapsedTime={elapsedTime}
          />
        ))}
      </div>

      {error && <div className="text-red-400 text-center mt-4">{error}</div>}

      <div className="mt-6 text-center space-x-4">
        <button 
          className="bg-white text-red-600 hover:bg-red-100 rounded px-3 py-1 transition duration-300 text-sm"
          onClick={handleStartCounting}
          disabled={isCountingStarted}
        >
          {isCountingStarted ? "Counting..." : "Start"}
        </button>
        <button 
          className="bg-white text-red-600 hover:bg-red-100 rounded px-3 py-1 transition duration-300 text-sm"
          onClick={handleStopCounting}
          disabled={!isCountingStarted}
        >
          Stop
        </button>
      </div>

      <SendDataModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleSendData}
      />
    </div>
  );
};

export default DynamicCCTVCounter;