import React, { useRef, useEffect } from 'react';

const Canvas = ({ model, inputShape, videoRef, updateObjectCounts }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (model.net && videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');

      const detectVideo = async () => {
        await detectVideo(videoRef.current, model, canvasRef.current, updateObjectCounts);
      };

      detectVideo();

      return () => {
        // Clean up if needed
      };
    }
  }, [model, videoRef, updateObjectCounts]);

  return <canvas width={inputShape[1]} height={inputShape[2]} ref={canvasRef} />;
};

export default Canvas;
