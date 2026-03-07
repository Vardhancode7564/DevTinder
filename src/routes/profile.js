const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middleware/auth");

profileRouter.get("/profile", userAuth, async (req, res) => {
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

module.exports = profileRouter;
