
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const connectDB = ()=>{
    mongoose.connect(process.env.DATABASE_URL)
    .then(()=>{
       console.log("database connected...")
    })
    .catch((err)=>{
       console.log("error in connection of database"+err);
    })

}
export default connectDB;