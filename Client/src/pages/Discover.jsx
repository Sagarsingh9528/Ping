import React, { useState } from "react";
import { UserPlus, UserCheck, MapPin, Users } from "lucide-react";
import { assets, dummyConnectionsData } from "../assets/assets";

function Discover() {
  const [input, setInput] = useState("");
  const [users, setUsers] = useState(dummyConnectionsData);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setLoading(true);
      setTimeout(() => {
        const filtered = dummyConnectionsData.filter((user) =>
  (user.name && user.name.toLowerCase().includes(input.toLowerCase())) ||
  (user.username && user.username.toLowerCase().includes(input.toLowerCase())) ||
  (user.bio && user.bio.toLowerCase().includes(input.toLowerCase())) ||
  (user.location && user.location.toLowerCase().includes(input.toLowerCase()))
);

        setUsers(filtered);
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Discover People</h1>
          <p className="text-slate-600">
            Connect with amazing people and grow your network
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search people by name, username, bio, or location..."
            className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Loading */}
        {loading && <p className="text-center text-slate-500">Searching...</p>}

        {/* Users Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {users.map((user, index) => (
            <div
              key={index}
              className="bg-white border rounded-xl shadow-sm p-6 flex flex-col items-center text-center"
            >
              {/* Avatar */}
              <img
                src={user.profile_picture || "https://via.placeholder.com/100"}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover mb-4"
              />

              {/* Name + Username */}
              <h3 className="font-semibold text-slate-900">{user.name}</h3>
              <p className="text-sm text-slate-500">@{user.username}</p>

              {/* Bio */}
              <p className="text-sm text-slate-600 mt-2">{user.bio}</p>

              {/* Location & Followers */}
              <div className="flex justify-center gap-4 text-xs text-slate-500 mt-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {user.location}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" /> {user.followers} Followers
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 w-full">
                {user.isFollowing ? (
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition">
                    <UserCheck className="w-4 h-4" />
                    Following
                  </button>
                ) : (
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition">
                    <UserPlus className="w-4 h-4" />
                    Follow
                  </button>
                )}

                {/* Optional: Message icon */}
                <button className="p-2 border rounded-md hover:bg-slate-100 transition">
                  💬
                </button>
              </div>
            </div>
          ))}

          {!loading && users.length === 0 && (
            <p className="col-span-full text-center text-slate-500">
              No people found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Discover;
