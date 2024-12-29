import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import useGetUserProfile from '@/hooks/useGetUserProfile';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from './ui/button';
import axios from 'axios';
import { Badge } from './ui/badge';
import { setAuthUser, setUserProfile } from '@/redux/authSlice'
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { AtSign, Heart, MessageCircle } from 'lucide-react';

const Profile = () => {
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);
  const [activeTab, setActiveTab] = useState('posts');
  const dispatch = useDispatch();
  const { userProfile, user } = useSelector(store => store.auth);
  const navigate = useNavigate();
  const isLoggedInUserProfile = user?._id === userProfile?._id;
  const [isFollowing,setIsFollowing] = useState(userProfile.followers.some((obj)=>obj._id==user._id) || false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  }
  //followUnfollow
  const followUnfollow = async () => {
    try {
        const res = await axios.get(`http://localhost:5500/api/v1/user/followorunfollow/${userProfile._id}`, {withCredentials:true});
        setIsFollowing(!isFollowing);
        if(res.data.success){
          
            dispatch(setUserProfile(res.data.targetUser));
            dispatch(setAuthUser(res.data.user))
            
            toast.success(res.data.message);
            

        }

    } catch (error) {
        console.log(error);
    }
}
// Update `isFollowing` when `userProfile` changes
useEffect(() => {
  if (userProfile) {
    setIsFollowing(userProfile.followers.some((follower) => follower._id === user._id));
  }
}, [userProfile, user]);
  const displayedPost = activeTab === 'posts' ? userProfile?.posts : userProfile?.bookmarks;
  if (!userProfile) {
    return <div>Loading...</div>;
  }
  return (
    <div className='flex max-w-5xl justify-center mx-auto pl-10'>
      <div className='flex flex-col  gap-20 p-8'>
        <div className='grid grid-cols-2'>
          <section className='flex items-center justify-center'>
            <Avatar className='h-32 w-32'>
              <AvatarImage src={userProfile?.profilePicture} alt="profilephoto" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className='flex flex-col gap-5'>
              <div className='flex items-center gap-2'>
                <span>{userProfile?.username}</span>
                {
                  isLoggedInUserProfile ? (
                    <>
                      <Link to="/account/edit"><Button variant='secondary' className='hover:bg-gray-200 h-8'>Edit profile</Button></Link>
                      
                    </>
                  ) : (
                    isFollowing ? (
                      <>
                        <Button variant='secondary' className='h-8' onClick={followUnfollow}>Unfollow</Button>
                        <Button variant='secondary' className='h-8' onClick = {()=>navigate('/chat')}>Message</Button>
                      </>
                    ) : (
                      <Button className='bg-[#0095F6] hover:bg-[#3192d2] h-8' onClick={followUnfollow}>Follow</Button>
                    )
                  )
                }
              </div>
              <div className='flex items-center gap-4'>
                <p><span className='font-semibold'>{userProfile?.posts.length} </span>posts</p>
                <p><span className='font-semibold'>{userProfile?.followers.length} </span>followers</p>
                <p><span className='font-semibold'>{userProfile?.following.length} </span>following</p>
              </div>
              <div className='flex flex-col gap-1'>
                <span className='font-semibold'>{userProfile?.bio || 'bio here...'}</span>
                <Badge className='w-fit' variant='secondary'><AtSign /> <span className='pl-1'>{userProfile?.username}</span> </Badge>
                <span>🤯Learn coding</span>
                <span>🤯Turing code into fun</span>
                <span>🤯DM for collaboration</span>
              </div>
            </div>
          </section>
        </div>
        <div className='border-t border-t-gray-200'>
          <div className='flex items-center justify-center gap-10 text-sm'>
            <span className={`py-3 cursor-pointer ${activeTab === 'posts' ? 'font-bold' : ''}`} onClick={() => handleTabChange('posts')}>
              POSTS
            </span>
            <span className={`py-3 cursor-pointer ${activeTab === 'saved' ? 'font-bold' : ''}`} onClick={() => handleTabChange('saved')}>
              SAVED
            </span>
            
          </div>
          <div className='grid grid-cols-3 gap-1'>
            {
              displayedPost && displayedPost?.map((post) => {
                return (
                  <div key={post?._id} className='relative group cursor-pointer'>
                    <img src={post.image} alt='postimage' className='rounded-sm my-2 w-full aspect-square ' />
                    <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                      <div className='flex items-center text-white space-x-4'>
                        <button className='flex items-center gap-2 hover:text-gray-300'>
                          <Heart />
                          <span>{post?.likes.length}</span>
                        </button>
                        <button className='flex items-center gap-2 hover:text-gray-300'>
                          <MessageCircle />
                          <span>{post?.comments.length}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

