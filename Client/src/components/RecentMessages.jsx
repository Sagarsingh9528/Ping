import React, { useEffect, useState } from "react";
import { dummyRecentMessagesData } from "../assets/assets";
import { Link } from "react-router-dom";
import moment from "moment";

function RecentMessages() {
  const [messages, setMessages] = useState([]);

  const fetchRecentMessages = async () => {
    setMessages(dummyRecentMessagesData);
  };

  useEffect(() => {
    fetchRecentMessages();
  }, []);

  return (
    <div className="bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800">
      <h3 className="font-semibold text-slate-800 mb-4">Recent Messages</h3>
      <div className="flex flex-col max-h-56 overflow-y-scroll no-scrollbar">
        {messages.map((msg, index) => {
          const sender = msg.from_user_id; // 👈 user object
          return (
            <Link
              key={msg._id}
              to={`/chat/${sender.username}`} // ✅ username from user object
              className="flex items-center gap-2 py-2 px-2 rounded-md hover:bg-slate-100 transition"
            >
              {/* Profile pic */}
              <img
                src={sender.profile_picture}
                className="w-8 h-8 rounded-full"
                alt={sender.full_name}
              />

              {/* Message Info */}
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
                  {msg.text ? msg.text : "Media"}
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
