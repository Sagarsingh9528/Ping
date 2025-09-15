import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { useAuth, useUser } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";

function RecentMessages() {
  const [messages, setMessages] = useState([]);
  const { user } = useUser();
  const { getToken } = useAuth();

  const fetchRecentMessages = async () => {
    try {
      const token = await getToken();
      const { data } = await api.get("/api/user/recent-messages", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // console.log("Recent messages API data:", data);

      // ✅ check the array itself, not only success
      if (Array.isArray(data.messages) && data.messages.length > 0) {
        // Group messages by sender and get the latest message for each sender
        const groupedMessages = data.messages.reduce((acc, message) => {
          const senderId = message.from_user_id?._id;
          if (!senderId) return acc;

          if (
            !acc[senderId] ||
            new Date(message.createdAt) > new Date(acc[senderId].createdAt)
          ) {
            acc[senderId] = message;

            // optional browser notification
            if (
              typeof Notification !== "undefined" &&
              Notification.permission === "granted" &&
              !message.seen
            ) {
              new Notification(
                message.from_user_id.full_name || "New Message",
                { body: message.text || "Media" }
              );
            }
          }
          return acc;
        }, {});

        // Sort messages by date
        const sortedMessages = Object.values(groupedMessages).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setMessages(sortedMessages);
      } else {
        // still show a toast if you want to notify about empty list
        toast.error(data.message || "No recent messages");
        setMessages([]); // make sure state resets
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      // ask for notification permission once
      if (typeof Notification !== "undefined" &&
          Notification.permission !== "granted" &&
          Notification.permission !== "denied") {
        Notification.requestPermission();
      }

      fetchRecentMessages();
      const intervalId = setInterval(fetchRecentMessages, 30000); // every 30s
      return () => clearInterval(intervalId); // ✅ cleanup correctly
    }
  }, [user]);

  return (
    <div className="bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800">
      <h3 className="font-semibold text-slate-800 mb-4">Recent Messages</h3>
      <div className="flex flex-col max-h-56 overflow-y-scroll no-scrollbar">
        {messages.length === 0 && (
          <p className="text-slate-500 text-center text-[11px] mt-2">
            No recent messages
          </p>
        )}

        {messages.map((msg) => {
          const sender = msg.from_user_id;
          if (!sender) return null;

          return (
            <Link
              key={msg._id}
              to={`/chat/${sender.username}`}
              className="flex items-center gap-2 py-2 px-2 rounded-md hover:bg-slate-100 transition"
            >
              <img
                src={sender.profile_picture || "/default-profile.png"}
                className="w-8 h-8 rounded-full"
                alt={sender.full_name || "User"}
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-slate-900 truncate leading-tight">
                    {sender.full_name}
                  </p>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-slate-500 whitespace-nowrap leading-none">
                      {moment(msg.createdAt).fromNow()}
                    </span>
                    {!msg.seen && (
                      <span className="bg-indigo-500 w-2 h-2 rounded-full mt-[2px]"></span>
                    )}
                  </div>
                </div>
                <p className="text-slate-600 text-[11px] truncate leading-tight mt-[2px]">
                  {msg.text || "Media"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default RecentMessages;
