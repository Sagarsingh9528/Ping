import React, { useEffect, useState } from "react";
import { MapPin, Users } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { fetchUser } from "../features/user/userSlice";

import UserCard from "../components/UserCard";

function Discover() {
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  
  const handleSearch = async (e) => {
    if (e.key === "Enter" && input.trim()) {
      try {
        setLoading(true);
        setUsers([]);
        const token = await getToken();
        const { data } = await api.post(
          "/api/user/discover",
          { input },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        data.success ? setUsers(data.users) : toast.error(data.message);
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
        setInput("");
      }
    }
  };

  
  useEffect(() => {
    getToken().then((token) => dispatch(fetchUser(token)));
  }, [dispatch, getToken]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Discover People</h1>
          <p className="text-slate-600">
            Connect with amazing people and grow your network
          </p>
        </div>

        
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

        {loading && (
          <p className="text-center text-slate-500">Searching...</p>
        )}

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {users.map((user) => (
            <UserCard key={user._id} user={user} />
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
