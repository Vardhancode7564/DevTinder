const mongoose=require('mongoose');


const connectDB=async ()=>{
 
    await mongoose.connect("mongodb+srv://harsha:vardhan@dev-tinder.uzf7nyx.mongodb.net/devTinder");

}


module.exports=connectDB;

