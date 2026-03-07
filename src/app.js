const express = require("express");
const app = express();

const connectDB = require("./config/database");
const User = require("./models/user");
const { ReturnDocument } = require("mongodb");

app.use(express.json()); // Middleware to parse JSON request bodies for all the middlewares

// Signup API
app.post("/signup", async (req, res) => {
    const{firstName,lastName,emailId,password,age,gender}=req.body;

  try {
    console.log("Received user data:", req.body);
    const newuser = {
      firstName,
      lastName,
      emailId,
      password,
      age,
      gender,
    };
    const user = new User(newuser);
    await user.save();
    console.log("User registered successfully");
    res.send("User registered successfully");
  } catch (err) {
    console.log("Error saving user to database", err.message);
    res.status(500).send("Error registering user");
  }
});

//get user by email
app.get("/user", async (req, res) => {
      const userEmail=req.body.emailId;
      try{
          
          console.log("Fetching user with email:", userEmail);
          const user=await User.findOne({emailId: userEmail});
          if(!user){
              return res.status(404).send("User not found");
          }
          console.log("User Found:",user);
          res.send(user);

      }catch(err){
          console.log("Error fetching user from database", err.message);
          res.status(500).send("Error fetching user");
        }
  
});

// Get all users for feed
app.get("/feed",async(req,res)=>{
    try{
        // default it gives all the records in the database
        const users=await User.find({});
        console.log("Fetched users for feed:", users);
        res.send(users);
    }catch(err){
        console.log("Error fetching users from database", err.message);
        res.status(500).send("Error fetching users");
    }
})

// delete user by id
app.delete("/user",async(req,res)=>{
    const userId=req.body.userId;
    try{
        const user=await User.findByIdAndDelete(userId);
        if(!user){
            return res.status(404).send("User not found");
        }
        console.log("User deleted successfully:", user);
        res.send("User deleted successfully");
    }catch(err){
        console.log("Error deleting user from database", err.message);
        res.status(500).send("Error deleting user");
    }
})

// update data of the user
app.patch("/user",async(req,res)=>{
    const userId=req.body.userId;
    const data=req.body;
    try{
        //const user=await User.findByIdAndUpdate({_id:userId},data,{new:true});
        //correct syntax for findByIdAndUpdate is to pass the id directly as the first argument, not an object
        const user = await User.findByIdAndUpdate(userId,data,{new:true});
        console.log("Updating user with ID:", userId, "and data:", data,{
            ReturnDocument:"after",
            runValidators:true
        });
        if(!user){
            return res.status(404).send("User not found");
        }
        console.log("User updated successfully:", user);
        res.send("User updated successfully");
    }catch(err){
        console.log("Error updating user in database",err.message);
        res.status(500).send("Error updating user");
    }
})

// delete user by emailId
app.delete("/user/:emailId",async(req,res)=>{
    const userEmail=req.params.emailId;
    try{
       const user=await User.findOneAndDelete({emailId:userEmail});
       if(!user){
        return res.status(404).send("User not found");
       }
        console.log("User deleted successfully:", user);4
        res.send("User deleted successfully");
    }catch(err){
        console.log("Error deleting user from database", err.message);
        res.status(500).send("Error deleting user");
    }
})

connectDB()
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");

    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.log("Error connecting to database", err);
  });
