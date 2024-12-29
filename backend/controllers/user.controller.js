import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";


//signUp

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(401).json({
                message: "Please fill all the fields!!!",
                success: false,
            });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(401).json({
                message: "User already exists!!!",
                success: false,
            });
        };
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username,
            email,
            password: hashedPassword
        });
        return res.status(201).json({
            message: "Account created successfully.",
            success: true,
        });
    } catch (error) {
        console.log(error);
    }
}


//login

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                message: "Please fill all the fields!",
                success: false,
            });
        }
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "User does not  exists!",
                success: false,
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Incorrect password!",
                success: false,
            });
        };

        const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });

        //populate each post if in the posts array
        const populatedPosts = await Promise.all(
            user.posts.map( async (postId) => {
                const post = await Post.findById(postId);
                if(post.author.equals(user._id)){
                    return post;
                }
                return null;
            })
        )
        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: populatedPosts
        }
        
        return res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 1 * 24 * 60 * 60 * 1000 }).json({
            message: `Welcome back ${user.username}`,
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
    }
};

// logout

export const logout = async (_, res) => {
    try {
        return res.cookie("token", "", { maxAge: 0 }).json({
            message: 'Logged out successfully.',
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};

//getProfile

export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        let user = await User.findById(userId).select('-password');
        await user.populate({ path: 'posts', select: '-author' });
        await user.populate({path:'bookmarks',select:'-author'});
        await user.populate({path:'followers',select:'-password'});
        await user.populate({path:'following',select:'-password'});
        
        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};

//editProfile

export const editProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePicture = req.file;
        let cloudResponse;

        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
                success: false
            });
        };
        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message: 'Profile updated.',
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
    }
};

// suggestedUses

export const getSuggestedUsers = async (req, res) => {
    try {
        const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password");
        if (!suggestedUsers) {
            return res.status(400).json({
                message: 'Currently do not have any users',
            })
        };
        return res.status(200).json({
            success: true,
            users: suggestedUsers
        })
    } catch (error) {
        console.log(error);
    }
};




       






export const followOrUnfollow = async (req, res) => {
    try {
        const followKrneWala = req.id; 
        const jiskoFollowKrungi = req.params.id; 
        
        if (followKrneWala === jiskoFollowKrungi) {
            return res.status(400).json({
                message: 'You cannot follow/unfollow yourself',
                success: false
            });
        }

        const [user, targetUser] = await Promise.all([
            User.findById(followKrneWala),
            User.findById(jiskoFollowKrungi)
        ]);

        if (!user || !targetUser) {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }

        const isFollowing = user.following.includes(jiskoFollowKrungi);

        if (isFollowing) {
            // Unfollow Logic
            user.following = user.following.filter(id => id.toString() !== jiskoFollowKrungi.toString());
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== followKrneWala.toString());
        } else {
            // Follow Logic
            user.following.push(jiskoFollowKrungi);
            targetUser.followers.push(followKrneWala);
        }

        await Promise.all([user.save(), targetUser.save()]);

        // Populate required fields in both users
        const populatedUser = await user.populate([
            { path: 'posts', select: '-author' },
            { path: 'bookmarks', select: '-author' },
            { path: 'followers', select: '-password' },
            { path: 'following', select: '-password' }
        ]);

        const populatedTargetUser = await targetUser.populate([
            { path: 'posts', select: '-author' },
            { path: 'bookmarks', select: '-author' },
            { path: 'followers', select: '-password' },
            { path: 'following', select: '-password' }
        ]);
        
        return res.status(200).json({
            message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
            user: populatedUser,
            targetUser: populatedTargetUser,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'An error occurred',
            success: false
        });
    }
};


//search user

export const searchUser = async (req, res)=>{
    try {
        const { search } = req.body

        const query = new RegExp(search,"i","g")

        const user = await User.find({
            "$or" : [
                { username : query },
                { email : query }
            ]
        }).select("-password")
        
        return res.status(200).json({
            message : 'all user',
            user,
            success : true
        });
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true
        })
    }
}
