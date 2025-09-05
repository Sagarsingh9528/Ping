import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import ChatBox from './pages/ChatBox'
import Connections from './pages/Connections'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import { useUser, useAuth } from '@clerk/clerk-react'
import Layout from './pages/Layout'
import { Toaster } from 'react-hot-toast'

function App() {
  const { user } = useUser()
  const { getToken } = useAuth()

  // ✅ Get user from backend
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!user) return

      try {
        const token = await getToken()  // 👈 Clerk se JWT token
        console.log("Clerk Token:", token)

        const res = await fetch("http://localhost:8080/api/user/me", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`, // 👈 Token backend me bhejna
          },
        })

        const data = await res.json()
        console.log("Backend User Response:", data)
      } catch (err) {
        console.error("Fetch user error:", err)
      }
    }

    fetchCurrentUser()
  }, [user, getToken])

  return (
    <>
      <Toaster />
      <Routes>
        <Route path='/' element={!user ? <Login /> : <Layout />}>
          <Route index element={<Feed />} />
          <Route path='messages' element={<Messages />} />
          <Route path='messages/:userId' element={<ChatBox />} />
          <Route path='connections' element={<Connections />} />
          <Route path='discover' element={<Discover />} />
          <Route path='profile' element={<Profile />} />
          <Route path='profile/:profileId' element={<Profile />} />
          <Route path='create-post' element={<CreatePost />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
