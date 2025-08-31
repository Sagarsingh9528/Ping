import React from 'react'
import { dummyUserData } from '../assets/assets'

function UserCard({user}) {
    const currentUser = dummyUserData

    const handleFollow = async () => {

    
    }

    const handleConnectionRequest = async () => {

    }

  return (
    <div className='p-4 pt-6 flex flex-col justify-between w-72 shadow border border-gray-200 rounded-md' key={user._id}>
        <div>
            <img src={user.profile_picture} alt="" />
        </div>

    </div>
  )
}

export default UserCard