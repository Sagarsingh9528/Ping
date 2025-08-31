import React, { useState } from "react";
import { dummyUserData } from "../assets/assets";
import { Pencil } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

function ProfileModal({setShowEdit}) {
  const user = dummyUserData;
  const [editForm, setEditForm] = useState({
    username: user.username,
    bio: user.bio,
    location: user.location,
    profile_picture: null,
    cover_photo: null,
    full_name: user.full_name,
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    toast.success("Profile updated successfully 🚀");
  };

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-110 h-screen overflow-y-scroll bg-black/50">
      <div className="max-w-2xl sm:py-6 mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

          <form className="space-y-4" onSubmit={handleSaveProfile}>
            {/* Profile Picture */}
            <div className="flex flex-col items-start gap-3">
              <label
                htmlFor="profile_picture"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Profile Picture
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  id="profile_picture"
                  onChange={(e) =>
                    setEditForm({ ...editForm, profile_picture: e.target.files[0] })
                  }
                />
                <div className="group/profile relative cursor-pointer w-24 h-24 mt-2">
                  <img
                    src={
                      editForm.profile_picture
                        ? URL.createObjectURL(editForm.profile_picture)
                        : user.profile_picture
                    }
                    className="w-24 h-24 rounded-full object-cover"
                    alt=""
                  />
                  <div className="absolute hidden group-hover/profile:flex top-0 left-0 right-0 bottom-0 bg-black/30 rounded-full items-center justify-center">
                    <Pencil className="w-5 h-5 text-white" />
                  </div>
                </div>
              </label>
            </div>

            {/* Cover Photo */}
            <div className="flex flex-col items-start gap-3">
              <label
                htmlFor="cover_photo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cover Photo
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  id="cover_photo"
                  onChange={(e) =>
                    setEditForm({ ...editForm, cover_photo: e.target.files[0] })
                  }
                />
                <div className="group/cover relative cursor-pointer mt-2 w-full max-w-md">
                  <img
                    src={
                      editForm.cover_photo
                        ? URL.createObjectURL(editForm.cover_photo)
                        : user.cover_photo
                    }
                    className="w-full h-40 rounded-lg object-cover"
                    alt=""
                  />
                  <div className="absolute hidden group-hover/cover:flex top-0 left-0 right-0 bottom-0 bg-black/30 rounded-lg items-center justify-center">
                    <Pencil className="w-6 h-6 text-white" />
                  </div>
                </div>
              </label>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={editForm.full_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, full_name: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={editForm.username}
                onChange={(e) =>
                  setEditForm({ ...editForm, username: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                rows={3}
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm({ ...editForm, bio: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={editForm.location}
                onChange={(e) =>
                  setEditForm({ ...editForm, location: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={()=>setShowEdit(false)}
                
                type="button"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default ProfileModal;
