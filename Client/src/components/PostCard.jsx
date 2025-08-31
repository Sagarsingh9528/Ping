import { BadgeCheck, Heart, MessageCircle, Share2 } from "lucide-react";
import moment from "moment";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);

  // Hashtags ko link banane ka helper
  const formatContent = (text) => {
    if (!text) return "";
    return text.replace(/#(\w+)/g, (match, tag) => {
      return `<a href="/hashtag/${tag}" class="text-blue-500 hover:underline">#${tag}</a>`;
    });
  };

  // Like handler
  const handleLike = () => {
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };

  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-3 w-full max-w-2xl">
      {/* user info */}
      <div onClick={()=>navigate('/profile/' + post.user._id)} className="inline-flex items-center gap-3 cursor-pointer">
        <img
          src={post.user.profile_picture}
          className="w-10 h-10 rounded-full shadow"
          alt=""
        />
        <div>
          <div className="flex items-center space-x-1">
            <span>{post.user.full_name}</span>
            <BadgeCheck className="w-4 h-5 text-blue-500" />
          </div>
          <div className="text-gray-500 text-sm">
            @{post.user.username} • {moment(post.createdAt).fromNow()}
          </div>
        </div>
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
              alt=""
            />
          ))}
        </div>
      )}

      {/* like, comment, share actions — ab pass me */}
      <div className="flex items-center gap-4 pt-1">
        {/* Like */}
        <button
          onClick={handleLike}
          className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition"
        >
          <Heart
            className={`w-5 h-5 ${liked ? "fill-red-500 text-red-500" : ""}`}
          />
          <span className="text-sm">{likes}</span>
        </button>

        {/* Comment */}
        <button className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">{post.comments?.length || 12}</span>
        </button>

        {/* Share */}
        <button className="flex items-center gap-1 text-gray-600 hover:text-green-500 transition">
          <Share2 className="w-5 h-5" />
          <span className="text-sm">{7}</span>
        </button>
      </div>
    </div>
  );
}

export default PostCard;
