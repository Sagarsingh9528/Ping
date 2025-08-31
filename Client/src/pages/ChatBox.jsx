import React, { useEffect, useRef, useState } from "react";
import { assets, dummyMessagesData, dummyUserData } from "../assets/assets";
import { Image, Send, X } from "lucide-react";

function ChatBox() {
  const messages = dummyMessagesData;
  const [text, setText] = useState("");
  const [images, setImages] = useState([]); // multiple images
  const [user, setUser] = useState(dummyUserData);
  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    if (!text && images.length === 0) return;

    console.log("Message Sent:", { text, images });

    // reset
    setText("");
    setImages([]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    user && (
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-gradient-to-r from-indigo-50 border-b border-gray-300">
          <img
            src={user.profile_picture}
            className="size-8 rounded-full"
            alt=""
          />
          <div>
            <p className="font-medium">{user.full_name}</p>
            <p className="text-sm text-gray-500 -mt-1.5">@{user.username}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="p-5 xl:pl-42 md:px-10 h-full overflow-y-scroll">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages
              .toSorted(
                (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
              )
              .map((msg, index) => (
                <div
                  className={`flex flex-col ${
                    msg.to_user_id !== user._id ? "items-start" : "items-end"
                  }`}
                  key={index}
                >
                  <div
                    className={`p-2 text-sm max-w-sm bg-white text-slate-700 rounded-lg shadow ${
                      msg.to_user_id !== user._id
                        ? "rounded-bl-none"
                        : "rounded-br-none"
                    }`}
                  >
                    {msg.messages_type === "image" && (
                      <img
                        src={assets.sample_tab}
                        className="w-full max-w-sm rounded-lg mb-1"
                        alt=""
                      />
                    )}
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Field */}
        <div className="px-4">
          <div className="flex items-center gap-2 pl-3 pr-2 py-2 bg-white w-full max-w-xl mx-auto border border-gray-200 shadow rounded-full mb-5">
            {/* Image Upload Button */}
            <label
              htmlFor="imageUpload"
              className="cursor-pointer flex items-center"
            >
              <Image
                className="text-gray-500 hover:text-indigo-500 cursor-pointer"
                size={22}
              />
            </label>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto max-w-[150px]">
                {images.map((img, index) => (
                  <div key={index} className="relative cursor-pointer">
                    <img
                      src={img}
                      alt="preview"
                      className="w-10 h-10 rounded-md object-cover"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-white p-1 rounded-full shadow cursor-pointer"
                      onClick={() => removeImage(index)}
                    >
                      <X size={14} className="text-gray-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Text Input */}
            <input
              type="text"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 outline-none bg-transparent text-sm ml-2"
            />

            {/* Send Button */}
            <button
              onClick={sendMessage}
              className="p-2 rounded-full hover:bg-indigo-50 cursor-pointer"
            >
              <Send size={20} className="text-indigo-600" />
            </button>
          </div>
        </div>
      </div>
    )
  );
}

export default ChatBox;
