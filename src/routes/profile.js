const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const { validateProfileData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");


profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user; // user details are attached to req object by userAuth middleware
    if (!user) {
      res.status(404).send("User not found");
    }
    console.log("User profile accessed:", user);
    console.log("Profile fetched successfully for user:", user.emailId);
    res.send({ message: "Profile fetched successfully", user });
  } catch (err) {
    console.log("Error fetching profile:", err.message);
    res.status(500).send("Error fetching profile");
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    console.log("Profile Edit Request Body:", req.body);

    if (!validateProfileData(req)) {
      return res.status(400).send("Invalid fields in profile update");
    }

    const loggedUser = req.user;

    if (!loggedUser) {
      return res.status(404).send("User not found");
    }

    // Update allowed fields
    Object.assign(loggedUser, req.body);

    await loggedUser.save();

    // Hide password before sending response
    loggedUser.password = undefined;

    console.log("Profile Updated Successfully for User:", loggedUser);

    res.status(200).send({
      message: "Profile updated successfully",
      user: loggedUser,
    });
  } catch (err) {
    console.log("Error updating profile:", err.message);

    res.status(500).send({
      message: "Error updating profile",
    });
  }
});

// profile password update route
profileRouter.patch("/profile/password",userAuth,async (req, res)=>{
  try {

    const {oldPassword,newPassword}=req.body;

    console.log("Password Update Request Body:", req.body);

    const loggedUser=req.user;

    // fetch user with password
    const user = await User.findById(loggedUser._id);

    const isPasswordValid=await user.validatePassword(oldPassword);

    if (!isPasswordValid) {
      return res.status(401).send("Old password is incorrect");
    }

    const passwordHash=await bcrypt.hash(newPassword,10);

    user.password=passwordHash;

    await user.save();
    console.log("Password updated successfully for user:", user.emailId);
    res.status(200).send("Password updated successfully");

  } catch(err){

    console.log("Password update error:", err.message);

    res.status(500).send("Error updating password");

  }
});
module.exports = profileRouter;
