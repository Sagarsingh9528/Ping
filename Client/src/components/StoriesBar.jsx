import React, { useEffect, useState } from "react";
import { dummyStoriesData } from "../assets/assets";
import { Plus } from "lucide-react";
import moment from "moment";
import StoryModal from "./StoryModal";
import StoryViewer from "./StoryViewer";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios.js";
import toast from "react-hot-toast";

function StoriesBar() {

  const {getToken} = useAuth();
  const [stories, setStories] = useState([]);
   const [showModal, setShowModal] = useState(false);
   const [viewStory, setViewStory] = useState(null);

  const fetchStories = async () => {
    try {
      const token = await getToken()
      const {data} = await api.get('/api/story/get', {
        headers: {Authorization: `Bearer ${token}`}
      })
      if (data.success) {
        setStories(data.stories)
      }else{
        toast(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return (
    <div className="w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl no-scrollbar overflow-x-auto px-4">
      <div className="flex gap-4 pb-5">
       
        <div onClick={()=>setShowModal(true)} className="flex-shrink-0 rounded-lg shadow-sm w-[100px] sm:w-[120px] md:w-[140px] lg:w-[160px] aspect-[3/4] cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-dashed border-indigo-300 bg-gradient-to-b from-indigo-50 to-white">
          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-500 rounded-full flex items-center justify-center mb-3">
              <Plus className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-700 text-center">
              Create Story
            </p>
          </div>
        </div>

        
        {stories.map((story, index) => (
          <div
          onClick={()=>setViewStory(story)}
            key={index}
            className="flex-shrink-0 relative rounded-lg shadow w-[100px] sm:w-[120px] md:w-[140px] lg:w-[160px] aspect-[3/4] cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-b from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 overflow-hidden"
          >
            
            <img
              src={story.user.profile_picture}
              alt={story.user.name}
              className="absolute w-8 h-8 md:w-10 md:h-10 top-3 left-3 rounded-full ring-2 ring-white shadow"
            />

            
            <p className="absolute top-16 left-3 right-3 text-white/80 text-xs sm:text-sm truncate">
              {story.content}
            </p>

            
            <p className="text-white absolute bottom-1 right-2 z-10 text-[10px] sm:text-xs">
              {moment(story.createdAt).fromNow()}
            </p>
            {story.media_type !== "text" && (
              <div className="absolute inset-0 z-1 rounded-lg bg-black overflow-hidden">
                {story.media_type === "image" ? (
                  <img
                    src={story.media_url}
                    className="h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80"
                    alt=""
                  />
                ) : (
                  <video
                    src={story.media_url}
                    className="h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80"
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && <StoryModal setShowModal={setShowModal} fetchStories={fetchStories}/>}
      
        {viewStory && <StoryViewer viewStory={viewStory} setViewStory={setViewStory}/>}


    </div>
  );
}

export default StoriesBar;
