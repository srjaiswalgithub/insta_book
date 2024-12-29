import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{type:String, required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    profilePicture:{type:String,default:''},
    bio:{type:String, default:''},
    gender:{type:String,enum:['male','female']},
    followers:[{type:mongoose.Schema.Types.ObjectId, ref:'socialMedia_User'}],
    following:[{type:mongoose.Schema.Types.ObjectId, ref:'socialMedia_User'}],
    posts:[{type:mongoose.Schema.Types.ObjectId, ref:'Post'}],
    bookmarks:[{type:mongoose.Schema.Types.ObjectId, ref:'Post'}]
},{timestamps:true});
export const User = mongoose.model('socialMedia_User', userSchema);