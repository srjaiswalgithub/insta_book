import React from 'react'
import Feed from './Feed'
import { Outlet } from 'react-router-dom'
import RightSidebar from './RightSidebar'
import useGetAllPost from '@/hooks/useGetAllPost'
import useGetSuggestedUsers from '@/hooks/useGetSuggestedUsers'

const Home = () => {
    useGetAllPost();
    useGetSuggestedUsers();
    return (
        <div className='flex  '>
            <div className='flex items-center justify-center '>
                <Feed />
                {/* <Outlet /> */}
            </div >
            <RightSidebar className = " " />
            
        </div>
    )
}

export default Home