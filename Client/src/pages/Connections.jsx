import React, { useEffect, useState } from "react";
import { Users, UserPlus, UserCheck, UserRoundPen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import { fetchConnections } from "../features/connections/connectionsSlice";
import api from "../api/axios";
import toast from "react-hot-toast";

// ✅ IMPORT THE ASSETS OBJECT
import { assets } from "../assets/assets";   // <-- add this line

function Connections() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const dispatch = useDispatch();

  const { connections, pendingConnections, followers, following } = useSelector(
    (state) => state.connections
  );

  const tabs = [
    { label: "Followers", value: followers, icon: Users },
    { label: "Following", value: following, icon: UserCheck },
    { label: "Pending", value: pendingConnections, icon: UserRoundPen },
    { label: "Connections", value: connections, icon: UserPlus },
  ];

  const acceptConnection = async (userId) => {
    try {
      const { data } = await api.post(
        "/api/user/accept",
        { id: userId },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );
      if (data.success) {
        toast.success(data.message);
        dispatch(fetchConnections(await getToken()));
      } else {
        toast(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      const { data } = await api.post(
        "/api/user/unfollow",
        { id: userId },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );
      if (data.success) {
        toast.success(data.message);
        dispatch(fetchConnections(await getToken()));
      } else {
        toast(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getToken().then((token) => {
      dispatch(fetchConnections(token));
    });
  }, [dispatch, getToken]);

  const [activeTab, setActiveTab] = useState(tabs[0].label);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Connections</h1>
          <p className="text-slate-600">
            Manage your network and discover new connections
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 flex flex-wrap gap-6">
          {tabs.map((tab, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center gap-1 border h-20 w-40 border-gray-200 bg-white shadow rounded-md"
            >
              <b className="text-xl">{tab.value.length}</b>
              <p className="text-slate-600">{tab.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-8 flex flex-wrap gap-2 border rounded-lg p-2 bg-white shadow-sm">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            return (
              <button
                key={index}
                onClick={() => setActiveTab(tab.label)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition 
                  ${
                    activeTab === tab.label
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {tabs.map(
            (tab) =>
              activeTab === tab.label &&
              tab.value.map((user, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 border rounded-xl bg-white shadow-sm"
                >
                  {/* Avatar */}
                  <img
                    src={user.profile_picture}
                    alt={user.name || "User"}
                    className="w-14 h-14 rounded-full object-cover"
                  />

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{user.name}</h3>
                    <p className="text-sm text-slate-500">@{user.username}</p>
                    <p className="text-sm text-slate-600">{user.bio}</p>
                  </div>

                  {/* View Profile */}
                  <button
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className="px-4 py-2 rounded-md text-white text-sm font-medium 
                               bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition"
                  >
                    View Profile
                  </button>

                  {activeTab === "Pending" && (
                    <button
                      onClick={() => acceptConnection(user._id)}
                      className="ml-2 px-4 py-2 rounded-md text-white text-sm font-medium bg-green-500 hover:bg-green-600 transition"
                    >
                      Accept
                    </button>
                  )}

                  {activeTab === "Following" && (
                    <button
                      onClick={() => handleUnfollow(user._id)}
                      className="ml-2 px-4 py-2 rounded-md text-white text-sm font-medium bg-red-500 hover:bg-red-600 transition"
                    >
                      Unfollow
                    </button>
                  )}
                  
                  {/* {activeTab === "Followers" && (
                    <button
                      onClick={() => {
                       
                      }}
                      className="ml-2 px-4 py-2 rounded-md text-white text-sm font-medium bg-blue-500 hover:bg-blue-600 transition"
                    >
                      Follow Back
                    </button>
                  )} */}
                  
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Connections;
