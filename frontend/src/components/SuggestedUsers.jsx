import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import axios from 'axios';
import { useEffect } from 'react';
import { setUserProfile } from '@/redux/authSlice';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import useGetUserProfile from '@/hooks/useGetUserProfile';
const SuggestedUsers = () => {
    const {user} = useSelector((store)=>store.auth);
    useGetUserProfile(user?._id);
    const { userProfile } = useSelector(store => store.auth);
    
    const [activeTab, setActiveTab] = useState('followers');
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    }
    const displayedusers = activeTab === 'followers' ? userProfile?.followers : userProfile?.following;
    const dispatch = useDispatch();
    //Unfollow
    const Unfollow = async (userId) => {
        try {
            const res = await axios.get(`http://localhost:5500/api/v1/user/followorunfollow/${userId}`, {withCredentials:true});
            if(res?.data?.success){
                dispatch(setUserProfile(res?.data?.user));
                toast.success(res?.data?.message);
            }
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
      
    }, [userProfile, user]);


    return (
        <div className='  my-10  '>
            <div className='flex   items-center  justify-between  text-sm '>
                <span className={`font-medium cursor-pointer ${activeTab === 'followers' ? 'font-bold' : ''}`} onClick={() => handleTabChange('followers')}>Followers</span>
                <span className={`font-medium   cursor-pointer ${activeTab === 'following' ? 'font-bold' : ''}`} onClick={() => handleTabChange('following')}>Following</span>
            </div>
            {
                (displayedusers && displayedusers.length>0) && displayedusers.map((user) => {
                    return (
                        <div key={user?._id} className='flex  items-center justify-between my-5'>
                            <div className='flex items-center gap-2'>
                                <Link to={`/profile/${user?._id}`}>
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
                            <span className='text-[#3BADF8] text-xs font-bold cursor-pointer hover:text-[#3495d6]' onClick={() => Unfollow(user?._id)}>{(activeTab==="following")&& "Unfollow"}</span>
                        </div>
                    )
                })
            }

        </div>

        
                       
    )
}

export default SuggestedUsers