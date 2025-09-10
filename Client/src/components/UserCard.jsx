import React from "react";
import { dummyUserData } from "../assets/assets";

function UserCard({ user }) {
  const currentUser = dummyUserData;

  const handleFollow = async () => {
    console.log(`Followed ${user.name}`);
    // TODO: Add API call to follow user
  };

  const handleConnectionRequest = async () => {
    console.log(`Sent connection request to ${user.name}`);
    // TODO: Add API call for connection request
  };

  return (
    <div className="p-4 pt-6 flex flex-col justify-between w-72 shadow border border-gray-200 rounded-md">
      {/* Profile Picture */}
      <div className="flex justify-center">
        <img
          src={user.profile_picture}
          alt={user.name}
          className="w-24 h-24 rounded-full object-cover border border-gray-300"
        />
      </div>

      {/* User Info */}
      <div className="text-center mt-4">
        <h3 className="text-lg font-semibold">{user.name}</h3>
        <p className="text-sm text-gray-600">{user.bio || "No bio yet"}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleFollow}
          className="flex-1 py-2 px-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Follow
        </button>
        <button
          onClick={handleConnectionRequest}
          className="flex-1 py-2 px-3 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
        >
          Connect
        </button>
      </div>
    </div>
  );
}

export default UserCard;
