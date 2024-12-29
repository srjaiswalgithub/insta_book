import React from 'react'
import Feed from './feed'
import { Outlet } from 'react-router-dom'
import RightSidebar from './Rightsidebar'
import useGetAllPost from '@/hooks/usegetallpost'
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