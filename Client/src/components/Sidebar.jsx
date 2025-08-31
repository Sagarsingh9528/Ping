import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate, Link } from 'react-router-dom'
import MenuItems from './MenuItems'
import { CirclePlus, LogOut } from 'lucide-react'
import { UserButton, useClerk, useUser } from '@clerk/clerk-react'

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate()
  const { signOut } = useClerk()
  const { user } = useUser()  // 👈 Clerk user hook

  return (
    <div
      className={`w-60 xl:w-72 bg-white border-r border-gray-200 flex flex-col justify-between items-center max-sm:absolute top-0 bottom-0 z-20 ${
        sidebarOpen ? 'translate-x-0' : 'max-sm:-translate-x-full'
      } transition-all duration-300 ease-in-out`}
    >
      <div className="w-full">
        {/* Logo */}
        <img
          onClick={() => navigate('/')}
          src={assets.logo}
          alt=""
          className="w-26 ml-7 my-2 cursor-pointer"
        />
        <hr className="border-gray-300 mb-8" />

        {/* Menu Items */}
        <MenuItems setSidebarOpen={setSidebarOpen} />

        {/* Create Post Button */}
        <Link
          to="/create-post"
          className="flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 transition text-white cursor-pointer"
        >
          <CirclePlus className="w-5 h-5" />
          Create Post
        </Link>
      </div>

      {/* Footer User Info */}
      <div className="w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between">
        <div className="flex gap-2 items-center cursor-pointer">
          {/* Clerk ka UserButton -> user photo dropdown ke sath */}
          <UserButton />

          <div>
            <h1 className="text-sm font-medium">
              {user?.fullName || "Guest"}
            </h1>
            <p className="text-xs text-gray-500">
              @{user?.username || user?.id?.slice(0, 8)}
            </p>
          </div>
        </div>

        {/* Logout */}
        <LogOut
          onClick={signOut}
          className="w-4.5 text-gray-400 hover:text-gray-700 transition cursor-pointer"
        />
      </div>
    </div>
  )
}

export default Sidebar
