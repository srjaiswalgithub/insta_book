import React, { useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { readFileAsDataURL } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { IoClose } from "react-icons/io5";
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '@/redux/postSlice';

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const {user} = useSelector(store=>store.auth);
  const {posts} = useSelector(store=>store.post);
  const dispatch = useDispatch();

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const dataUrl = await readFileAsDataURL(file);
      setImagePreview(dataUrl);
    }
  }

  const createPostHandler = async (e) => {
    const formData = new FormData();
    formData.append("caption", caption);
    if (imagePreview) formData.append("image", file);
    try {
      setLoading(true);
      const res = await axios.post('https://insta-book-2.onrender.com/api/v1/post/addpost', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]));// [1] -> [1,2] -> total element = 2
        toast.success(res.data.message);
        setOpen(false);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  return (
   

    <div className='fixed top-0 bottom-0 left-0 right-0 bg-slate-700 bg-opacity-40 p-2 z-10 ' >

      <div className='bg-white flex flex-col  gap-3 mx-auto max-w-lg mt-10 mt-2 w-full p-4 rounded h-full max-h-fit '>
        <div className = 'flex flex-row justify-between align center  '>
        <h1 className = 'text-center font-semibold m-2 text-2xl'>Create New Post</h1>
          <div className=' text-xl p-2 lg:text-2xl hover:black-500' onClick={()=>setOpen(false)}>
              <button >
                  <IoClose/>
              </button>
          </div>
          
        </div>
        
        <div className='flex gap-3 items-center'>
          <Avatar>
            <AvatarImage src={user?.profilePicture} alt="img" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className='font-semibold text-xs'>{user?.username}</h1>
            <span className='text-gray-600 text-xs'>Bio here...</span>
          </div>
        </div>
        <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} className="focus-visible:ring-transparent border-none" placeholder="Write a caption..." />
         {
         imagePreview && (
          <div className='w-full h-64 flex items-center justify-center'>
           <img src={imagePreview} alt="preview_img" className='object-cover h-full w-full rounded-md' />
         </div>
        )
        }
        <input ref={imageRef} type='file' className='hidden' onChange={fileChangeHandler} />
         <Button onClick={() => imageRef.current.click()} className='w-fit mx-auto bg-[#0095F6] hover:bg-[#258bcf] '>Select from computer</Button>
         {
           imagePreview && (
             loading ? (
               <Button>
                 <Loader2 className='mr-2 h-4 w-4 animate-spin' />
               Please wait
             </Button>
              ) : (
              <Button onClick={createPostHandler} type="submit" className="w-full">Post</Button>
              )
            )
          }
      </div>
    </div>
  )
}

export default CreatePost