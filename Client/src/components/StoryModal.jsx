import { useAuth } from "@clerk/clerk-react";
import {
  ArrowLeft,
  Image as ImageIcon,
  Sparkle,
  TextIcon,
  Video as VideoIcon,
} from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";


function StoryModal({ setShowModal, fetchStories }) {
  const bgColors = ["#4f46e5", "#7c3aed", "#db2777", "#e11d48", "#ca8a04", "#0d9488"];

  const [mode, setMode] = useState("text"); // "text" | "media"
  const [background, setBackground] = useState(bgColors[0]);
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { getToken } = useAuth();

  const MAX_VIDEO_DURATION = 60; // seconds
  const MAX_VIDEO_SIZE_MB = 50; // MB

  // 📂 Upload media (image/video)
  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMode("media");

    if (file.type.startsWith("video")) {
      if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
        toast.error(`Video file size cannot exceed ${MAX_VIDEO_SIZE_MB} MB.`);
        setMedia(null);
        setPreviewUrl(null);
        return;
      }

      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > MAX_VIDEO_DURATION) {
          toast.error("Video duration cannot exceed 1 minute.");
          setMedia(null);
          setPreviewUrl(null);
        } else {
          setMedia(file);
          setPreviewUrl(URL.createObjectURL(file));
          setText("");
          setMode("media");
          
         
        }
      };
      video.src = URL.createObjectURL(file);
    } else if (file.type.startsWith("image")) {
      setMedia(file);
      setPreviewUrl(URL.createObjectURL(file));
      setText("");
      setMode("media");
      
    }
  };

  const handleCreateStory = async () => {
    const media_type =
      mode === "media"
        ? media?.type.startsWith("image")
          ? "image"
          : "video"
        : "text";

    if (media_type === "text" && !text.trim()) {
      throw new Error("Please enter some text");
    }

    const formData = new FormData();
    formData.append("content", text);
    formData.append("media_type", media_type);
    if (media) formData.append("media", media);
    formData.append("background_color", background);

    const token = await getToken();

    const { data } = await api.post("/api/story/create", formData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (data.success) {
      setShowModal(false);
      toast.success("Story created successfully");
      fetchStories();
    } else {
      toast.error(data.message || "Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 z-[110] min-h-screen bg-black/80 backdrop-blur text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-4 flex items-center justify-between">
          <button
            onClick={() => setShowModal(false)}
            className="text-white p-2 cursor-pointer"
          >
            <ArrowLeft />
          </button>
          <h2 className="text-lg font-semibold">Create Story</h2>
          <span className="w-10"></span>
        </div>

        {/* Story Preview */}
        <div
          className="rounded-lg h-96 flex items-center justify-center relative overflow-hidden"
          style={{ backgroundColor: mode === "text" ? background : "#000" }}
        >
          {mode === "text" && (
            <textarea
              className="bg-transparent text-white w-full h-full p-6 text-lg resize-none focus:outline-none text-center"
              placeholder="What's on your mind?"
              onChange={(e) => setText(e.target.value)}
              value={text}
            />
          )}

          {mode === "media" && previewUrl && (
            <>
              {media?.type.startsWith("image") ? (
                <img
                  src={previewUrl}
                  alt="story preview"
                  className="object-contain max-h-full"
                />
              ) : (
                <video
                  src={previewUrl}
                  controls
                  className="object-contain max-h-full"
                />
              )}
            </>
          )}
        </div>

        {/* Background selector (only for text mode) */}
        {mode === "text" && (
          <div className="flex mt-5 gap-2">
            {bgColors.map((color, idx) => (
              <button
                key={idx}
                className={`w-6 h-6 rounded-full ring-2 ${
                  background === color ? "ring-white" : "ring-transparent"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setBackground(color)}
              />
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-between mt-5 items-center">
          {/* Mode Switch + Upload */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode("text")}
              className={`px-3 py-1 rounded-lg text-sm ${
                mode === "text" ? "bg-indigo-600" : "bg-white/20"
              }`}
            >
              <TextIcon size={18} /> Text
            </button>

            {/* Photo Upload */}
            <label className="px-3 py-1 rounded-lg text-sm bg-white/20 cursor-pointer flex items-center gap-1">
              <ImageIcon size={16} />
              Photo
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleMediaUpload(e)}
                className="hidden"
              />
            </label>

            {/* Video Upload */}
            <label className="px-3 py-1 rounded-lg text-sm bg-white/20 cursor-pointer flex items-center gap-1">
              <VideoIcon size={16} />
              Video
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleMediaUpload(e)}
                className="hidden"
              />
            </label>
          </div>

          {/* Share button */}
          <button
            onClick={() =>
              toast.promise(handleCreateStory(), {
                loading: "Saving...",
                
              })
            }
            className="px-4 py-2 bg-indigo-600 rounded-lg text-2xl font-medium items-center justify-center flex"
          >
            <Sparkle size={18} />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

export default StoryModal;
