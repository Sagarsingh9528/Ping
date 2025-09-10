import React, { useEffect, useState } from "react";
import { assets, dummyPostsData } from "../assets/assets";
import Loading from "../components/Loading";
import StoriesBar from "../components/StoriesBar";
import PostCard from "../components/PostCard";
import RecentMessages from "../components/RecentMessages";

function Feed() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeeds = async () => {
    // TODO: yaha backend API se fetch karna h future me
    setFeeds(dummyPostsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  return !loading ? (
    <div className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">
      {/* Story + Post list */}
      <div className="flex-1 max-w-2xl">
        <StoriesBar />
        <div className="p-4 space-y-6">
          {feeds.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="max-xl:hidden sticky top-0">
        <div className="max-w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow">
          <h3 className="text-slate-800 font-semibold">Sponsored</h3>
          <img
            src={assets.sponsored_img}
            className="w-full h-40 object-cover rounded-md"
            alt="sponsored"
          />
          <p className="text-slate-600 font-medium">Email marketing</p>
          <p className="text-slate-400">
            Supercharge your marketing with a powerful, easy-to-use platform for results.
          </p>
        </div>

        {/* Recent Messages */}
        <h3 className="mt-6 text-slate-800 font-semibold"><RecentMessages/></h3>
        <div className="bg-white p-3 rounded-md shadow text-slate-600">
        
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  );
}

export default Feed;