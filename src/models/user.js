const mongoose=require('mongoose');

const userschema=mongoose.Schema({
    firstName:{
        type:String,
        required: [true, 'Please provide your First Name'],
        minLength:3,
        maxLength:50
    },

    lastName:{
        type:String,
        required: [true, 'Please provide your Last Name'],
        minLength:4,
        maxLength:50   
    },
    emailId:{
        type:String,
        lowercase:true,
        required: [true, 'Please provide your Email Id'],
        unique: true,
        trim:true,
    },
    password:{
        type:String,
        required: [true, 'Please provide your Password'],
    },
    age:{
        type:Number,
        min:18,
        required: [true, 'Please provide your Age'],
    },
    gender:{
        type:String,
        validate(value){
            if(!["male","female","other"].includes(value.toLowerCase())){
                throw new Error("Gender is Not valid.");
            }
        },
        required: [true, 'Please provide your Gender'],
    },
    photoUrl:{
        type:String,
        default:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    },
    about:{
        type:String,
 
    },
    skills:{
        type:[String],
    },
    // createdAt:{
    //     type:Date,
    //     default:Date.now,
    // }
    
  },
  {
        timestamps:true
  } 

);


module.exports=mongoose.model("User",userschema);