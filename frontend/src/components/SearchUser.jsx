import React, { useEffect, useState } from 'react'
import { IoSearchOutline } from "react-icons/io5";
import Loading from './Loading';
import UserSearchCard from './UserSearchCard';

import axios from 'axios';

import { useDispatch } from 'react-redux';
import { IoClose } from "react-icons/io5";

const SearchUser = ({searchOpen,setSearchOpen}) => {
    const [searchUser,setSearchUser] = useState([])
    const [loading,setLoading] = useState(false)
    const [search,setSearch] = useState("")
    const dispatch = useDispatch();

    
    const handleSearchUser = async () => {

        try {
            setLoading(true)
            const res = await axios.post(`http://localhost:5500/api/v1/user/search-user`, { search }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            
            if (res.data.success) {
                setLoading(false);
                setSearchUser(res.data.user);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
        handleSearchUser()
    },[search])

    
  return (
    <div className='fixed top-0 bottom-0 left-0 right-0 bg-slate-700 bg-opacity-40 p-2 z-10'>
        <div className='w-full max-w-lg mx-auto mt-10'>
            {/**input search user */}
            <div className='bg-white rounded h-14 overflow-hidden flex '>
                <input 
                    type='text'
                    placeholder='Search user by name, email....'
                    className='w-full outline-none py-1 h-full px-4'
                    onChange={(e)=>setSearch(e.target.value)}
                    value={search}
                />
                <div className='h-14 w-14 flex justify-center items-center'>
                    <IoSearchOutline size={25}/>
                </div>
            </div>

            {/**display search user */}
            <div className='bg-white mt-2 w-full p-4 rounded h-full max-h-[70vh] overflow-scroll'>
                {/**no user found */}
                {
                    searchUser && searchUser.length === 0 && !loading && (
                        <p className='text-center text-slate-500'>no user found!</p>
                    )
                } 

                {
                    loading && (
                        <p><Loading/></p>
                    )
                }

                {
                    searchUser && searchUser.length !==0 && !loading && (
                        searchUser.map((user)=>{
                            return(

                                <UserSearchCard key={user._id} user={user} searchOpen={searchOpen} setSearchOpen = {setSearchOpen} />
                            )
                        })
                    )
                } 


            </div>
        </div>

        <div className='absolute top-0 right-0 text-2xl p-2 lg:text-4xl hover:text-white' onClick={()=>setSearchOpen(false)}>
            <button >
                <IoClose/>
            </button>
        </div>
    </div>
  )
}

export default SearchUser
