import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Link } from 'react-router-dom'

const UserSearchCard = ({user, searchOpen,setSearchOpen}) => {
  return (
    <div className='flex items-center gap-2' onClick={()=>setSearchOpen(false)}>
        <Link to={`/profile/${user?._id}` }>
            <Avatar>
                <AvatarImage src={user?.profilePicture} alt="post_image" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
        </Link>
        <div>
            <h1 className='font-semibold text-sm'><Link to={`/profile/${user?._id}`}>{user?.username}</Link></h1>
            <span className='text-gray-600 text-sm'>{user?.bio || 'Bio here...'}</span>
        </div>
    </div>
    
    
  )
}

export default UserSearchCard
