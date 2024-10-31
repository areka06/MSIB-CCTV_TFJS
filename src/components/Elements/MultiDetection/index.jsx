  import React, { useState, useEffect, useCallback, useRef } from "react";
  import * as tf from "@tensorflow/tfjs";
  import "@tensorflow/tfjs-backend-webgl";
  import Hls from "hls.js";
  import { detect, detectVideo } from "/src/utils/detect.js";
  import { 
    Car, 
    Bike, 
    Truck, 
    Bus, 
    User, 
    Timer,
    ArrowRightCircle,
    ArrowLeftCircle,
    SendHorizontal,
    RefreshCw
  } from "lucide-react";

  const DETECTION_INTERVAL = 1000 * 4; 
  const BATCH_SIZE = 4; 

  export default function MultiVideoDetection({ initialStreams = [] }) {
    const [loading, setLoading] = useState({ loading: true, progress: 0 });
    const [model, setModel] = useState(null);
    const [streams, setStreams] = useState([]);
    const [accessTime] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isProcessing, setIsProcessing] = useState(false);
    
    const detectionRefs = useRef({
      intervals: {},
      processing: {},
      frameQueue: {}
    });

    const modelName = "yolov8n";

    useEffect(() => {
      const timeInterval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(timeInterval);
    }, []);


    useEffect(() => {
      async function loadModel() {
        await tf.ready();
        await tf.setBackend('webgl');
        
        const gl = document.createElement('canvas').getContext('webgl2');
        if (gl) {
          tf.env().set('WEBGL_FORCE_F16_TEXTURES', true);
          tf.env().set('WEBGL_PACK', true);
        }

        const yolov8 = await tf.loadGraphModel(
          `/${modelName}_web_model/model.json`,
          {
            onProgress: (fractions) => {
              setLoading({ loading: true, progress: fractions });
            },
          }
        );

        const dummyInput = tf.ones(yolov8.inputs[0].shape);
        const warmupResults = yolov8.execute(dummyInput);

        setLoading({ loading: false, progress: 1 });
        setModel({
          net: yolov8,
          inputShape: yolov8.inputs[0].shape,
        });

        tf.dispose([warmupResults, dummyInput]);
      }

      loadModel();
    }, []);

    useEffect(() => {
      if (model && initialStreams.length > 0) {
        setStreams(initialStreams.map((url, index) => ({
          id: `stream-${index}`,
          url,
          vehicleCounts: {
            carsCrossedIn: 0,
            motorcyclesCrossedIn: 0,
            trucksCrossedIn: 0,
            busesCrossedIn: 0,
            pedestriansCrossedIn: 0,
            carsCrossedOut: 0,
            motorcyclesCrossedOut: 0,
            trucksCrossedOut: 0,
            busesCrossedOut: 0,
            pedestriansCrossedOut: 0,
          },
          totalCounts: {
            totalCrossedIn: 0,
            totalCrossedOut: 0,
          },
          isActive: true,
        })));
      }
    }, [model, initialStreams]);

    const processBatch = useCallback(async (streamId, videoElement, canvasElement) => {
      if (!detectionRefs.current.processing[streamId] && model) {
        detectionRefs.current.processing[streamId] = true;
        
        try {
          await detectVideo(videoElement, model, canvasElement, (counts) =>
            updateObjectCounts(streamId, counts)
          );
        } finally {
          detectionRefs.current.processing[streamId] = false;
        }
      }
    }, [model]);

    const startDetection = useCallback((videoElement, canvasElement, streamId) => {
      if (detectionRefs.current.intervals[streamId]) return;

      detectionRefs.current.intervals[streamId] = setInterval(() => {
        processBatch(streamId, videoElement, canvasElement);
      }, DETECTION_INTERVAL);
    }, [processBatch]);

    const stopDetection = useCallback((streamId) => {
      if (detectionRefs.current.intervals[streamId]) {
        clearInterval(detectionRefs.current.intervals[streamId]);
        delete detectionRefs.current.intervals[streamId];
      }
    }, []);


    useEffect(() => {
      streams.forEach((stream) => {
        const videoElement = document.getElementById(`video-${stream.id}`);
        const canvasElement = document.getElementById(`canvas-${stream.id}`);

        if (videoElement && canvasElement && model) {
          if (Hls.isSupported()) {
            const hls = new Hls({
              maxBufferLength: 30,
              maxMaxBufferLength: 60,
            });
            
            hls.loadSource(stream.url);
            hls.attachMedia(videoElement);
            
            hls.on(Hls.Events.ERROR, (event, data) => {
              if (data.fatal) {
                console.error(`HLS error for stream ${stream.id}:`, data);
                hls.destroy();
              }
            });

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              videoElement.play();
            });

            videoElement.addEventListener("waiting", () => {
              stopDetection(stream.id);
            });

            videoElement.addEventListener("playing", () => {
              if (stream.isActive) {
                startDetection(videoElement, canvasElement, stream.id);
              }
            });
          }
        }
      });

      return () => {
        streams.forEach((stream) => {
          stopDetection(stream.id);
        });
      };
    }, [streams, model, startDetection, stopDetection]);

    const updateObjectCounts = (streamId, counts) => {
      setStreams((prevStreams) =>
        prevStreams.map((stream) =>
          stream.id === streamId
            ? {
                ...stream,
                vehicleCounts: counts,
                totalCounts: {
                  totalCrossedIn: Object.values(counts)
                    .filter((key) => key.toString().includes("In"))
                    .reduce((a, b) => a + b, 0),
                  totalCrossedOut: Object.values(counts)
                    .filter((key) => key.toString().includes("Out"))
                    .reduce((a, b) => a + b, 0),
                },
              }
            : stream
        )
      );
    };

    const formatTime = (date) => {
      return date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    const sendDataToBackend = async () => {
      setIsProcessing(true);
      const data = streams.map((stream) => ({
        deviceID: stream.id,
        vehicleCounts: stream.vehicleCounts,
        totalCounts: stream.totalCounts,
        accessTime: accessTime.toISOString(),
        currentTime: currentTime.toISOString(),
      }));

      try {
        const response = await fetch("http://localhost:3013/objects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to send data");
        }

        alert("Data sent successfully!");
      } catch (error) {
        console.error(error);
        alert("Error sending data");
      } finally {
        setIsProcessing(false);
      }
    };

    if (loading.loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <RefreshCw className="w-12 h-12 animate-spin text-customRed mb-4" />
          <p className="text-lg font-medium">
            Loading model... {(loading.progress * 100).toFixed(2)}%
          </p>
        </div>
      );
    }

    return (
      <div className="bg-gray-100 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {streams.map((stream) => (
              <div key={stream.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="border-b px-6 py-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Timer className="w-5 h-5" />
                    <span>Stream: {stream.id}</span>
                  </h2>
                </div>
                <div className="relative aspect-video">
                  <video
                    id={`video-${stream.id}`}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    width="640"
                    height="360"
                  />
                  <canvas
                    id={`canvas-${stream.id}`}
                    className="absolute top-0 left-0 w-full h-full"
                    width="680"
                    height="600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6 p-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <ArrowRightCircle className="w-5 h-5 text-green-500" />
                      Masuk Simpang
                    </h3>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2">
                        <Car className="w-4 h-4" /> {stream.vehicleCounts.carsCrossedIn}
                      </p>
                      <p className="flex items-center gap-2">
                        <Bike className="w-4 h-4" /> {stream.vehicleCounts.motorcyclesCrossedIn}
                      </p>
                      <p className="flex items-center gap-2">
                        <Truck className="w-4 h-4" /> {stream.vehicleCounts.trucksCrossedIn}
                      </p>
                      <p className="flex items-center gap-2">
                        <Bus className="w-4 h-4" /> {stream.vehicleCounts.busesCrossedIn}
                      </p>
                      <p className="flex items-center gap-2">
                        <User className="w-4 h-4" /> {stream.vehicleCounts.pedestriansCrossedIn}
                      </p>
                      <p className="font-bold text-green-600">
                        Total: {stream.totalCounts.totalCrossedIn}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <ArrowLeftCircle className="w-5 h-5 text-red-500" />
                      Keluar Simpang
                    </h3>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2">
                        <Car className="w-4 h-4" /> {stream.vehicleCounts.carsCrossedOut}
                      </p>
                      <p className="flex items-center gap-2">
                        <Bike className="w-4 h-4" /> {stream.vehicleCounts.motorcyclesCrossedOut}
                      </p>
                      <p className="flex items-center gap-2">
                        <Truck className="w-4 h-4" /> {stream.vehicleCounts.trucksCrossedOut}
                      </p>
                      <p className="flex items-center gap-2">
                        <Bus className="w-4 h-4" /> {stream.vehicleCounts.busesCrossedOut}
                      </p>
                      <p className="flex items-center gap-2">
                        <User className="w-4 h-4" /> {stream.vehicleCounts.pedestriansCrossedOut}
                      </p>
                      <p className="font-bold text-red-600">
                        Total: {stream.totalCounts.totalCrossedOut}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Timer className="w-4 h-4" /> Waktu Akses: {formatTime(accessTime)}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Timer className="w-4 h-4" /> Waktu Sekarang: {formatTime(currentTime)}
                </p>
              </div>
              <button
                onClick={sendDataToBackend}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-customRed text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <SendHorizontal className="w-4 h-4" />
                {isProcessing ? "Mengirim..." : "Kirim Data"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

