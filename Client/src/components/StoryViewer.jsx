import { BadgeCheck, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

function StoryViewer({ viewStory, setViewStory }) {
  const [progress, setProgress] = useState(0);
  const duration = viewStory.media_type === "video" ? null : 5000; 
  const timerRef = useRef(null);

  const handleClose = () => {
    clearInterval(timerRef.current);
    setViewStory(null);
  };

  useEffect(() => {
    if (!viewStory) return;

    if (viewStory.media_type === "image" || viewStory.media_type === "text") {
      setProgress(0);
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timerRef.current);
            setViewStory(null); 
            return 100;
          }
          return prev + 2; 
        });
      }, duration / 50);
    }

    return () => clearInterval(timerRef.current);
  }, [viewStory]);

  const renderContent = () => {
    switch (viewStory.media_type) {
      case "image":
        return (
          <img
            src={viewStory.media_url}
            className="max-w-full max-h-screen object-contain rounded-lg"
            alt=""
          />
        );
      case "video":
        return (
          <video
            src={viewStory.media_url}
            className="max-h-screen rounded-lg"
            autoPlay
            muted
            playsInline
            controls
            onEnded={() => setViewStory(null)}
          />
        );
      case "text":
        return (
          <div className="w-full h-full flex items-center justify-center p-8 text-white text-2xl text-center">
            {viewStory.content}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 h-screen bg-black bg-opacity-90 z-50 flex items-center justify-center"
      style={{
        backgroundColor:
          viewStory.media_type === "text"
            ? viewStory.background_color
            : "#000000",
      }}
    >
      
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-700">
        <div
          className="h-full bg-white transition-all duration-100 linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      
      <div className="absolute top-4 left-4 flex items-center space-x-3 p-2 px-4 sm:p-4 sm:px-8 backdrop-blur-2xl rounded bg-black/50">
        <img
          src={viewStory.user?.profile_picture}
          alt=""
          className="size-7 sm:size-8 rounded-full object-cover border border-white"
        />
        <div className="text-white font-medium flex items-center gap-1.5">
          <span>{viewStory.user?.full_name}</span>
          <BadgeCheck size={18} />
        </div>
      </div>

      
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white text-3xl font-bold"
      >
        <X className="w-8 h-8 hover:scale-110 transition cursor-pointer" />
      </button>

      
      <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
}

export default StoryViewer;
