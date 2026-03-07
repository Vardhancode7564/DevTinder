const express=require("express");
const requestRouter=express.Router();
const { userAuth } = require("../middleware/auth");
requestRouter.post("/sendConnectionRequest", userAuth, async (req, res) => {
  const user = req.user; // authenticated user details from token
  //sending connection request from one user to another
  console.log("Sending the connection request");

  res.send(user.firstName + " sent Request successfully");
});



module.exports=requestRouter;