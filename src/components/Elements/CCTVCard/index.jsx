import React, { useRef, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import VideoPlayer from "/src/components/Elements/Video/index";
import { detectVideo } from "/src/utils/detect.js";

const CCTVCard = ({ title, videoSrc, deviceID, model, updateObjectCounts }) => {
  const canvasRef = useRef(null);

  const handleCanPlay = () => {
    const canvasElement = canvasRef.current;
    const videoElement = document.querySelector(".video-js");

    if (!videoElement || !canvasElement || !model.net) return;

    // Inisialisasi pendeteksian ketika video bisa diputar
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    detectVideo(videoElement, model, canvasElement, updateObjectCounts);
  };

  return (
    <div className="bg-white mb-6 rounded-lg shadow transition-transform duration-500">
      <div className="p-4">
        <h2 className="text-lg font-bold text-red-600">{title}</h2>
      </div>
      <VideoPlayer videoSrc={videoSrc} onCanPlay={handleCanPlay} />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
    </div>
  );
};

export default CCTVCard;
