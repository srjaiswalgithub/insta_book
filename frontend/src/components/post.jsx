
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Bookmark,BookmarkPlus, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { Button } from './ui/button'
import useGetUserProfile from '@/hooks/useGetUserProfile'
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from './CommentDialog'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Badge } from './ui/badge'
import { setUserProfile } from '@/redux/authSlice'
import { Link } from 'react-router-dom'
import { useEffect } from 'react'

const Post = ({ post }) => {
    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);
    useGetUserProfile(user._id);
    const { userProfile } = useSelector(store => store.auth);
   
    const { posts } = useSelector(store => store.post);
    const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
    const [postLike, setPostLike] = useState(post.likes.length);
    const [comment, setComment] = useState(post.comments);
    const dispatch = useDispatch();
    const [bookmark,setBookmark] = useState(userProfile.bookmarks.some((obj)=>obj._id==post._id)|| false);
    const [isFollowing,setIsFollowing] = useState(userProfile.following.some((obj)=>obj._id==post.author._id) || false);
    
    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
            setText(inputText);
        } else {
            setText("");
        }
    }

    const likeOrDislikeHandler = async () => {
        try {
            const action = liked ? 'dislike' : 'like';
            const res = await axios.get(`https://insta-book-2.onrender.com/api/v1/post/${post._id}/${action}`, { withCredentials: true });
            
            if (res.data.success) {
                const updatedLikes = liked ? postLike - 1 : postLike + 1;
                setPostLike(updatedLikes);
                setLiked(!liked);

                // apne post ko update krunga
                const updatedPostData = posts.map(p =>
                    p._id === post._id ? {
                        ...p,
                        likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                    } : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const commentHandler = async () => {

        try {
            const res = await axios.post(`https://insta-book-2.onrender.com/api/v1/post/${post._id}/comment`, { text }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            
            if (res.data.success) {
                const updatedCommentData = [...comment, res.data.comment];
                setComment(updatedCommentData);

                const updatedPostData = posts.map(p =>
                    p._id === post._id ? { ...p, comments: updatedCommentData } : p
                );

                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
                setText("");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const deletePostHandler = async () => {
        try {
            const res = await axios.delete(`https://insta-book-2.onrender.com/api/v1/post/delete/${post?._id}`, { withCredentials: true })
            if (res.data.success) {
                const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id);
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.messsage);
        }
    }

    const bookmarkHandler = async () => {
        try {
            const res = await axios.get(`https://insta-book-2.onrender.com/api/v1/post/${post?._id}/bookmark`, {withCredentials:true});
            setBookmark(!bookmark);
            if(res?.data?.success){
                dispatch(setUserProfile(res?.data?.user));
                
                toast.success(res?.data?.message);
                

            }

        } catch (error) {
            console.log(error);
        }
    }

    //followUnfollow
  const followUnfollow = async () => {
    try {
        const res = await axios.get(`https://insta-book-2.onrender.com/api/v1/user/followorunfollow/${post.author._id}`, {withCredentials:true});
        setIsFollowing(!isFollowing);
        if(res.data.success){
          
            dispatch(setUserProfile(res.data.user));
            
            
            toast.success(res.data.message);
            

        }

    } catch (error) {
        console.log(error);
    }
}

// Update `isFollowing` when `userProfile` changes
useEffect(() => {
  if (userProfile) {
    setIsFollowing(userProfile.following.some((follower) => follower._id === post.author._id));
    setBookmark(userProfile.bookmarks.some((obj)=>obj._id==post._id))
  }
}, [userProfile, user]);

if (!userProfile) {
    return <div>Loading...</div>;
}
    return (
        <div className='my-8 w-full max-w-sm mx-auto'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <Link to = {`/profile/${post.author._id}`}>
                    <Avatar>
                        <AvatarImage src={post.author?.profilePicture} alt="post_image" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    </Link>
                    
                    <div className='flex items-center gap-3'>
                        <h1>{post.author?.username}</h1>
                       {user?._id === post.author._id &&  <Badge variant="secondary">Author</Badge>}
                    </div>
                </div>
                <Dialog>
                    <DialogTrigger >
                        <MoreHorizontal className='cursor-pointer' />
                    </DialogTrigger>
                    <DialogContent className="flex flex-col items-center text-sm text-center">
                        {
                            
                        post?.author?._id !== user?._id && <Button variant='ghost' className="cursor-pointer w-fit text-[#ED4956] font-bold" onClick={followUnfollow}>{(isFollowing)?'Unfollow':"Follow"}</Button>
                        }
                        
                        
                        {
                            user && user?._id === post?.author._id && <Button onClick={deletePostHandler} variant='ghost' className="cursor-pointer w-fit">Delete</Button>
                        }
                    </DialogContent>
                </Dialog>
            </div>
            <img
                className='rounded-sm my-2 w-full  '
                src={post.image}
                alt="post_img"
            />

            <div className='flex items-center justify-between my-2'>
                <div className='flex items-center gap-3'>
                    {
                        liked ? <FaHeart onClick={likeOrDislikeHandler} size={'24'} className='cursor-pointer text-red-600' /> : <FaRegHeart onClick={likeOrDislikeHandler} size={'22px'} className='cursor-pointer hover:text-gray-600' />
                    }

                   
                    <Dialog>
                        <DialogTrigger >
                            <MessageCircle onClick={() => {
                            dispatch(setSelectedPost(post));
                            setOpen(true);
                            }} className='cursor-pointer hover:text-gray-600' />
                        </DialogTrigger>
                        <DialogContent onInteractOutside={() => setOpen(false)} className="max-w-5xl p-0 flex flex-col">
                            <CommentDialog open={open} setOpen={setOpen} />
                        </DialogContent>
                        
                    </Dialog>
                    
                </div>
                {!bookmark?<Bookmark onClick={bookmarkHandler} className='cursor-pointer hover:text-gray-600' />:<BookmarkPlus onClick={bookmarkHandler} className='cursor-pointer hover:text-gray-600' />}
            </div>
            <span className='font-medium block mb-2'>{postLike} likes</span>
            <p>
                <span className='font-medium mr-2'>{post.author?.username}</span>
                {post.caption}
            </p>
            {
                comment.length > 0 && (
                    

                    <Dialog>
                        <DialogTrigger >
                            <span onClick={() => {
                            dispatch(setSelectedPost(post));
                            setOpen(true);
                            }} className='cursor-pointer text-sm text-gray-400'>View all {comment.length} comments</span>
                        </DialogTrigger>
                        <DialogContent onInteractOutside={() => setOpen(false)} className="max-w-5xl p-0 flex flex-col">
                            <CommentDialog open={open} setOpen={setOpen} />
                        </DialogContent>
                        
                    </Dialog>
                )
            }
            
            <div className='flex items-center justify-between'>
                <input
                    type="text"
                    placeholder='Add a comment...'
                    value={text}
                    onChange={changeEventHandler}
                    className='outline-none text-sm w-full'
                />
                {
                    text && <span onClick={commentHandler} className='text-[#3BADF8] cursor-pointer'>Post</span>
                }

            </div>
        </div>
    )
}

export default Post