import React from "react";
import { dummyConnectionsData } from "../assets/assets";
import { EyeIcon, MessagesSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Messages() {

  const navigate = useNavigate()

  return (
    <div className="min-h-screen relative bg-slate-50">
      <div className="max-w-2xl mx-auto p-6">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
          <p className="text-slate-600">Talk to your friends and family</p>
        </div>

        {/* Connected Users */}
        <div className="flex flex-col gap-4">
          {dummyConnectionsData.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-4 p-4 bg-white rounded-md shadow-sm hover:shadow-md transition"
            >
              {/* Profile Picture */}
              <img
                src={user.profile_picture}
                className="w-12 h-12 rounded-full object-cover"
                alt={user.full_name}
              />

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">
                  {user.full_name}
                </p>
                <p className="text-sm text-slate-500">@{user.username}</p>
                <p className="text-sm text-slate-600 truncate">{user.bio}</p>
              </div>
              <div className="flex flex-col gap-2 mt-4">
                <button onClick={()=>navigate(`/messages/${user._id}`)} className="size-10 flex items-center justify-center text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer gap-1">
                  <MessagesSquare className="w-4 h-4"/>
                </button>

                <button onClick={()=>navigate(`/profile/${user._id}`)} className="size-10 flex items-center justify-center text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer">
                  <EyeIcon className="w-4 h-4"/>
                </button>


              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Messages;
