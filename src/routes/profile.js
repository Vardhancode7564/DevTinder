const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const { validateProfileData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const validator= require("validator");
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

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required"
      });
    }

    const loggedUser = req.user;

    // Compare old password
    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      loggedUser.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect"
      });
    }

    // Validate new password strength
    if (!validator.isStrongPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain uppercase, lowercase, number and symbol"
      });
    }

    //Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    loggedUser.password = passwordHash;

    await loggedUser.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });

  } catch(error){

    console.error("Password update error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });

  }
});

module.exports = profileRouter;
