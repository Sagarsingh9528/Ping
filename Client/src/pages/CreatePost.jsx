import React, { useState } from "react";
import { dummyUserData } from "../assets/assets";
import { Image } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios.js";
import { useNavigate } from "react-router-dom";

function CreatePost() {

  const navigate = useNavigate()
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = useSelector((state)=>state.user.value);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    
    setImages((prev) => [...prev, ...files]);
  };

  const {getToken} = useAuth()

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      toast.error("Post cannot be empty");
      return Promise.reject("Empty post"); 
    }

    setLoading(true);

    const postType = images.length && content ? 'text_with_image' : images.length ? 'image' : 'text'
    try {
      const formData = new FormData();
      formData.append('content', content)
      formData.append('post_type', postType)
      images.map((image)=>{
        formData.append('images', image)
      })

      const {data} = await api.post('api/post/add', formData, {
        headers: {Authorization: `Bearer ${await getToken()}`}
      })

      if (data.success) {
        navigate('/')
      }else{
        console.log(data.message)
        throw new Error(data.message)
      }
    } catch (error) {
      console.log(error.message)
      throw new Error(error.message)
    }
    setLoading(false)
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Post</h1>
          <p className="text-slate-600">Share your thoughts with the world</p>
        </div>

        
        <div className="max-w-xl bg-white p-4 sm:p-8 rounded-xl shadow-md space-y-4">
          
          <div className="flex items-center gap-3">
            <img
              src={user.profile_picture}
              className="w-12 h-12 rounded-full shadow"
              alt="profile"
            />
            <div>
              <h2 className="font-semibold">{user.full_name}</h2>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>
          </div>

          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="w-full resize-none p-2 text-slate-700 focus:outline-none focus:ring-0 border-b border-gray-200"
            rows={3}
          />

          
          <div className="flex items-center justify-between pt-2">
           
            <label className="cursor-pointer flex items-center text-slate-500 hover:text-slate-700">
              <Image className="w-6 h-6" />
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>

            
            <button
              onClick={() =>
                toast.promise(handleSubmit(), {
                  loading: "Uploading...",
                  success: "Post Added 🎉",
                  error: "Failed to add post",
                })
              }
              disabled={loading}
              className="px-5 py-2 rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Publishing..." : "Publish Post"}
            </button>
          </div>

          
          {images.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(img)}
                  alt="preview"
                  className="w-20 h-20 object-cover rounded-md border"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreatePost;
