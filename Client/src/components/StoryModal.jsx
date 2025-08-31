import { ArrowLeft, Image as ImageIcon, Sparkle, TextIcon, Video as VideoIcon } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

function StoryModal({ setShowModal, fetchStories }) {
  const bgColors = ["#4f46e5", "#7c3aed", "#db2777", "#e11d48", "#ca8a04", "#0d9488"];

  const [mode, setMode] = useState("text"); // text | media
  const [background, setBackground] = useState(bgColors[0]);
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // 📂 Upload media (image/video)
  const handleMediaUpload = (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      setMode("media");
      setMedia(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreateStory = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newStory = {
          id: Date.now(),
          type: mode,
          background,
          content: text,
          mediaUrl: previewUrl,
          createdAt: "Just now",
          user: {
            name: "You",
            profile_picture:
              "https://ui-avatars.com/api/?name=You&background=4f46e5&color=fff",
          },
        };

        console.log("Created story:", newStory);

        setShowModal(false);
        fetchStories();
        resolve(newStory);
      }, 1000); // simulate API delay
    });
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
                onChange={(e) => handleMediaUpload(e, "photo")}
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
                onChange={(e) => handleMediaUpload(e, "video")}
                className="hidden"
              />
            </label>
          </div>

          {/* Share button */}
          <button
            onClick={() =>
              toast.promise(handleCreateStory(), {
                loading: "Saving...",
                success: <p>Story Added</p>,
                error: (e) => <p>{e.message}</p>,
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
