const mongoose=require('mongoose');

const userschema=mongoose.Schema({
    firstName:{
        type:String,
        required: [true, 'Please provide your First Name'],
    },

    lastName:{
        type:String,
        required: [true, 'Please provide your Last Name'],
    },
    emailId:{
        type:String,
        required: [true, 'Please provide your Email Id'],
        unique: true,
    },
    password:{
        type:String,
        required: [true, 'Please provide your Password'],
    },
    age:{
        type:Number,
        required: [true, 'Please provide your Age'],
    },
    gender:{
        type:String,
        required: [true, 'Please provide your Gender'],
    },
    createdAt:{
        type:Date,
        default:Date.now,
    }
});


module.exports=mongoose.model("User",userschema);