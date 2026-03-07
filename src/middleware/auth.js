const jwt=require("jsonwebtoken");
const User=require("../models/user");

const userAuth=async(req,res,next)=>{
   try{
        //read the token from the req cookies
        const token=req.cookies.token;
        if(!token){
            return res.status(401).send("Unauthorized: No token provided");
        }
        const decodedObj= jwt.verify(token,process.env.JWT_SECRET); 

        //validate the token
        const user= await User.findById(decodedObj.id).select("-password");
        if(!user){
            return res.status(401).send("Unauthorized: User not found");
        }
        // find the user from the token
        req.user=user;
        next();
    }catch(err){
        console.log("Authentication error:", err.message);
        res.status(401).send("Unauthorized: Invalid token");
    }

};

module.exports={userAuth};