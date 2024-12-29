import React from 'react'
import { Outlet } from 'react-router-dom'
import LeftSidebar from './LeftSidebar'

const MainLayout = () => {
  return (
    <div>
       
      <div className = "flex  ">
        <LeftSidebar />
         
         
        <div  className = "w-full ">
            <Outlet/>
        </div>
    </div>
    </div>
    
  )
}

export default MainLayout