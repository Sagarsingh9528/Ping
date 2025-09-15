import { BadgeCheck, Heart, MessageCircle, Share2, Trash2 } from "lucide-react";
import moment from "moment";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";

function PostCard({ post, onDelete }) {
  // ✅ likes is an array of userIds (if backend sends it)
  const [likes, setLikes] = useState(post.likes || []);

  const { getToken } = useAuth();
  const currentUser = useSelector((state) => state.user.value);
  const navigate = useNavigate();

  // ✅ derive liked status from likes array
  const liked = likes.includes(currentUser?._id);

  // 🔗 Format hashtags
  const formatContent = (text) =>
    text
      ? text.replace(
          /#(\w+)/g,
          (_match, tag) =>
            `<a href="/hashtag/${tag}" class="text-blue-500 hover:underline">#${tag}</a>`
        )
      : "";

  // ❤️ Like / Unlike
  const handleLike = async () => {
    try {
      const token = await getToken();
      const { data } = await api.post(
        "/api/post/like",
        { postId: post._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        setLikes((prev) =>
          liked
            ? prev.filter((id) => id !== currentUser._id)
            : [...prev, currentUser._id]
        );
      } else {
        toast.error(data.message || "Unable to like post");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  // 🗑️ Delete handler
  const handleDelete = () => {
    if (onDelete) onDelete(post._id);
  };

  const isOwner = currentUser?._id === post.user?._id;

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-3 w-full max-w-2xl">
      {/* user info */}
      <div
        onClick={() => navigate("/profile/" + post.user?._id)}
        className="inline-flex items-center gap-3 cursor-pointer"
      >
        <img
          src={post.user?.profile_picture}
          className="w-10 h-10 rounded-full shadow"
          alt="profile"
        />
        <div>
          <div className="flex items-center space-x-1">
            <span>{post.user?.full_name}</span>
            <BadgeCheck className="w-4 h-5 text-blue-500" />
          </div>
          <div className="text-gray-500 text-sm">
            @{post.user?.username} • {moment(post.createdAt).fromNow()}
          </div>
        </div>

        {isOwner && (
          <Trash2
            onClick={handleDelete}
            className="ml-auto text-gray-400 hover:text-red-600 cursor-pointer"
          />
        )}
      </div>

      {/* content */}
      {post.content && (
        <div
          className="text-gray-800 text-sm whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
        />
      )}

      {/* images */}
      {post.image_urls?.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {post.image_urls.map((img, index) => (
            <img
              src={img}
              key={index}
              className={`w-full h-48 object-cover rounded-lg ${
                post.image_urls.length === 1 && "col-span-2 h-auto"
              }`}
              alt="post"
            />
          ))}
        </div>
      )}

      {/* like, comment, share */}
      <div className="flex items-center gap-4 pt-1">
        {/* Like */}
        <button
          onClick={handleLike}
          // disabled={isOwner}
          className={`flex items-center gap-1 transition ${
            isOwner
              ? "text-gray-400 cursor-pointer"
              : "text-gray-600 hover:text-red-500"
          }`}
        >
          <Heart
            className={`w-5 h-5 ${liked ? "fill-red-500 text-red-500" : ""}`}
          />
          <span className="text-sm">{likes.length}</span>
        </button>

        {/* Comment */}
        <button className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">{post.comments?.length || 0}</span>
        </button>

        {/* Share */}
        <button className="flex items-center gap-1 text-gray-600 hover:text-green-500 transition">
          <Share2 className="w-5 h-5" />
          <span className="text-sm">7</span>
        </button>
      </div>
    </div>
  );
}

export default PostCard;
