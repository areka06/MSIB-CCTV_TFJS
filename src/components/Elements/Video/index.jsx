// src/components/VideoPlayer.js
import React, { useEffect, useRef } from "react";
import videojs from "video.js";

const VideoPlayer = ({ videoSrc, model, canvasRef, onCanPlay }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const player = videojs(videoRef.current, {
      techOrder: ["html5"],
      sources: [{ src: videoSrc, type: "application/x-mpegURL" }],
      controls: false,
    });

    playerRef.current = player;

    player.on("loadedmetadata", function () {
      player.getChild("controlBar").hide();
    });

    player.on("canplay", () => {
      if (videoRef.current && canvasRef.current && model) {
        onCanPlay(videoRef.current, model, canvasRef.current);
      }
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [videoSrc, model, canvasRef, onCanPlay]);

  return <video id={`video-player-${videoSrc}`} autoPlay muted ref={videoRef} />;
};

export default VideoPlayer;
