import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhoneOff,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Repeat,
  MoreVertical,
} from "lucide-react";

const VideoCall = ({ localStream, remoteStream, onEndCall }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [showControls, setShowControls] = useState(true);

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Update window size on resize
  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Attach local and remote streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Auto-hide controls after 5s
  useEffect(() => {
    if (showControls) {
      const timer = setTimeout(() => setShowControls(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showControls]);

  const handleScreenClick = () => {
    setShowControls(true);
  };

  const hasRemote = !!remoteStream;

  return (
    <div
      className="flex flex-col items-center justify-between w-full h-screen bg-black relative overflow-hidden"
      onClick={handleScreenClick}
    >
      {/* Remote video fullscreen OR local fullscreen (if no remote yet) */}
      {hasRemote ? (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Local video small draggable overlay (only if remote exists) */}
      {hasRemote && (
        <motion.div
          drag
          dragConstraints={{
            top: 20,
            left: 20,
            right: windowSize.width - 120 - 20, // 120px video width + padding
            bottom: windowSize.height - 220, // keep above controls
          }}
          dragElastic={0.2}
          dragMomentum={false}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute w-28 h-40 bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-700 cursor-grab"
          style={{ top: 20, right: 20 }}
        >
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-6 w-full flex items-center justify-center gap-6"
          >
            {/* Mic */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMicOn(!isMicOn);
                localStream?.getAudioTracks().forEach(
                  (track) => (track.enabled = !isMicOn)
                );
              }}
              className="p-4 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition"
            >
              {isMicOn ? <Mic size={22} /> : <MicOff size={22} />}
            </button>

            {/* Camera */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCameraOn(!isCameraOn);
                localStream?.getVideoTracks().forEach(
                  (track) => (track.enabled = !isCameraOn)
                );
              }}
              className="p-4 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition"
            >
              {isCameraOn ? <Camera size={22} /> : <CameraOff size={22} />}
            </button>

            {/* End Call */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEndCall();
              }}
              className="p-4 bg-red-600 rounded-full text-white hover:bg-red-700 transition"
            >
              <PhoneOff size={22} />
            </button>

            {/* Switch Camera (stub for now) */}
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-4 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition"
            >
              <Repeat size={22} />
            </button>

            {/* More */}
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-4 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition"
            >
              <MoreVertical size={22} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoCall;
