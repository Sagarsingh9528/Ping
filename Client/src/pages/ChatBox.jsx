import React, { useEffect, useRef, useState } from "react";
import { Image, Send, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import { addMessage, fetchMessages, resetMessages } from "../features/messages/messageSlice";
import toast from "react-hot-toast";

function ChatBox() {
  const { messages } = useSelector((state) => state.messages);
  const connections = useSelector((state) => state.connections.connections);
  const { userId } = useParams(); // the other user
  const { getToken, userId: currentUserId } = useAuth(); // logged-in user
  const dispatch = useDispatch();

  const [text, setText] = useState("");
  const [image, setImage] = useState(null); // ✅ single image
  const [user, setUser] = useState(null);

  const messagesEndRef = useRef(null);

  // Fetch messages
  const fetchUserMessages = async () => {
    try {
      const token = await getToken();
      dispatch(fetchMessages({ token, userId }));
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Send text + image
  const sendMessage = async () => {
    try {
      if (!text && !image) return;

      const token = await getToken();
      const formData = new FormData();
      formData.append("to_user_id", userId);
      formData.append("text", text);
      if (image) formData.append("image", image); // ✅ must match backend

      const { data } = await api.post("/api/message/send", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setText("");
        setImage(null);
        dispatch(addMessage(data.message)); // single message
      } else {
        throw new Error(data.message || "Failed to send message");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Initial load & cleanup
  useEffect(() => {
    fetchUserMessages();
    return () => dispatch(resetMessages());
  }, [userId]);

  // Set chat user info
  useEffect(() => {
    if (connections.length > 0) {
      const u = connections.find((c) => c._id === userId);
      setUser(u || null);
    }
  }, [connections, userId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle image selection
  const handleImageUpload = (e) => {
    const file = e.target.files[0]; // single file
    setImage(file || null);
  };

  const removeImage = () => setImage(null);

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-gradient-to-r from-indigo-50 border-b border-gray-300">
        <img src={user.profile_picture} className="w-8 h-8 rounded-full" alt="" />
        <div>
          <p className="font-medium">{user.full_name}</p>
          <p className="text-sm text-gray-500 -mt-1.5">@{user.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="p-5 xl:pl-42 md:px-10 h-full overflow-y-scroll">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages
            .filter(Boolean)
            .slice()
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map((msg, index) => {
              const isSentByCurrentUser = msg.from_user_id === currentUserId;
              return (
                <div
                  className={`flex flex-col ${isSentByCurrentUser ? "items-end" : "items-start"}`}
                  key={msg._id || index}
                >
                  <div
                    className={`p-2 text-sm max-w-sm bg-white text-slate-700 rounded-lg shadow ${
                      isSentByCurrentUser ? "rounded-br-none" : "rounded-bl-none"
                    }`}
                  >
                    {msg.messages_type === "image" && msg.images?.length > 0 && (
                      <img
                        src={msg.images[0]}
                        className="w-full max-w-sm rounded-lg mb-1"
                        alt=""
                      />
                    )}
                    <p>{msg.text}</p>
                  </div>
                </div>
              );
            })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-4">
        <div className="flex items-center gap-2 pl-3 pr-2 py-2 bg-white w-full max-w-xl mx-auto border border-gray-200 shadow rounded-full mb-5">
          {/* Image Upload */}
          <label htmlFor="imageUpload" className="cursor-pointer flex items-center">
            <Image className="text-gray-500 hover:text-indigo-500 cursor-pointer" size={22} />
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />

          {/* Preview */}
          {image && (
            <div className="relative cursor-pointer">
              <img
                src={URL.createObjectURL(image)}
                alt="preview"
                className="w-10 h-10 rounded-md object-cover"
              />
              <button
                type="button"
                className="absolute -top-2 -right-2 bg-white p-1 rounded-full shadow cursor-pointer"
                onClick={removeImage}
              >
                <X size={14} className="text-gray-600" />
              </button>
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

          {/* Send */}
          <button
            onClick={sendMessage}
            className="p-2 rounded-full hover:bg-indigo-50 cursor-pointer"
          >
            <Send size={20} className="text-indigo-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatBox;
