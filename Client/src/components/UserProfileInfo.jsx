import { Verified, MapPin, Calendar, PenBox } from "lucide-react";
import React from "react";

function UserProfileInfo({ user, posts, profileId, setShowEdit }) {
  // helper to format date -> "Month YYYY"
  const formatJoinedDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <div className="relative py-4 px-6 md:px-8 bg-white">
      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Profile Picture */}
        <div className="w-32 h-32 border-4 border-white shadow-lg absolute -top-16 rounded-full overflow-hidden">
          <img
            src={user.profile_picture || "/default-avatar.png"} // ✅ only schema field + fallback
            className="w-full h-full object-cover rounded-full"
            alt="profile"
          />
        </div>

        {/* User Info */}
        <div className="w-full pt-16 md:pt-0 md:pl-36">
          <div className="flex flex-col md:flex-row items-start justify-between w-full">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.full_name}
                </h1>
                {user.is_verified && (
                  <Verified className="w-6 h-6 text-blue-500" />
                )}
              </div>
              <p className="text-gray-600">
                {user.username ? `@${user.username}` : "Add a username"}
              </p>

              {/* Bio */}
              {user.bio && (
                <p className="mt-3 text-gray-800 text-sm leading-relaxed">
                  {user.bio}
                </p>
              )}

              {/* Location + Joined */}
              <div className="flex flex-wrap gap-4 mt-3 text-gray-500 text-sm">
                {user.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {user.location}
                  </span>
                )}
                {user.createdAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {formatJoinedDate(user.createdAt)}
                  </span>
                )}
              </div>

              {/* Stats Row */}
              <div className="flex gap-6 mt-6 text-sm border-t border-gray-200 pt-4">
                <span>
                  <b>{posts.length}</b> Posts
                </span>
                <span>
                  <b>{user.followers?.length || 0}</b> Followers
                </span>
                <span>
                  <b>{user.following?.length || 0}</b> Following
                </span>
              </div>
            </div>

            {/* Edit Button */}
            {!profileId && (
              <button
                onClick={() => setShowEdit(true)}
                className="mt-4 md:mt-0 bg-white border px-4 py-2 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-100 transition relative z-10 flex gap-1 cursor-pointer"
              >
                <PenBox className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfileInfo;
