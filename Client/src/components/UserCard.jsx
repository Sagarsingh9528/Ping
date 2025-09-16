import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { fetchUser } from "../features/user/userSlice";
import { MessageCircle, Plus, UserPlus } from "lucide-react";

function UserCard({ user }) {
  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleFollow = async () => {
    try {
      console.log("Follow button clicked"); 
      const token = await getToken();
      const { data } = await api.post(
        "/api/user/follow",
        { id: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        dispatch(fetchUser(token)); 
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleConnectionRequest = async () => {
    if (currentUser?.connections.includes(user._id)) {
      return navigate("/messages/" + user._id);
    }
    try {
      const token = await getToken();
      const { data } = await api.post(
        "/api/user/connect",
        { id: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      data.success ? toast.success(data.message) : toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const alreadyFollowing = currentUser?.following.includes(user._id);
  const alreadyConnected = currentUser?.connections.includes(user._id);

  return (
    <div className="p-4 pt-6 flex flex-col justify-between w-72 shadow border border-gray-200 rounded-md bg-white relative z-10">
      <div className="flex justify-center">
        <img
          src={user?.profile_picture || "/default-avatar.png"}
          alt={user?.full_name}
          className="w-24 h-24 rounded-full object-cover border border-gray-300"
        />
      </div>

      <div className="text-center mt-4">
        <h3 className="text-lg font-semibold">{user?.full_name}</h3>
        <p className="text-sm text-gray-600">{user?.bio ?? "No bio yet"}</p>
      </div>

      <div className="flex gap-3 mt-6">
        
        <button
          type="button"
          onClick={handleFollow}
          disabled={alreadyFollowing}
          className="flex-1 py-2 px-3 bg-indigo-600 text-white rounded-md
                     hover:bg-indigo-700 flex items-center justify-center gap-1
                     disabled:opacity-60 active:scale-95 transition"
        >
          <UserPlus className="w-4 h-4" />
          {alreadyFollowing ? "Following" : "Follow"}
        </button>

        
        <button
          type="button"
          onClick={handleConnectionRequest}
          className="flex-1 py-2 px-3 bg-gray-100 border border-gray-300 rounded-md
                     hover:bg-gray-200 flex items-center justify-center gap-1
                     active:scale-95 transition"
        >
          {alreadyConnected ? (
            <MessageCircle className="w-5 h-5" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          {alreadyConnected ? "Message" : "Connect"}
        </button>
      </div>
    </div>
  );
}

export default UserCard;
