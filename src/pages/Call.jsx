import React, { useEffect, useState } from "react";
import VideoCall from "../components/VideoCall";

const Call = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  useEffect(() => {
    // Request camera and mic
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        // For demo purpose: show your own stream as "remote"
        setRemoteStream(stream);
      })
      .catch((err) => {
        console.error("Error accessing media devices:", err);
      });
  }, []);

  const handleEndCall = () => {
    // Stop all tracks
    localStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    setRemoteStream(null);
    alert("Call Ended");
  };

  return (
    <>
      {localStream ? (
        <VideoCall
          localStream={localStream}
          remoteStream={remoteStream}
          onEndCall={handleEndCall}
        />
      ) : (
        <div className="flex items-center justify-center h-screen bg-black text-white">
          Loading Camera...
        </div>
      )}
    </>
  );
};

export default Call;
