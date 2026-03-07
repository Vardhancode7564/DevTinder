// ## authRouter

// * POST /signup
// * POST /login
// * POST /logout

const express = require("express");
const authRouter=express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); 
const User = require("../models/user");
const { validateSignupData } = require("../utils/validation");

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignupData(req);

    const { firstName, lastName, emailId, password, age, gender } = req.body;

    const existingUser = await User.findOne({ emailId });

    if (existingUser) {
      return res.status(400).send("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      age,
      gender,
    });

    await user.save();

    res.status(201).send("User registered successfully");
  } catch (err) {
    console.log("Signup Error:", err.message);
    res.status(400).send(err.message);
  }
});


authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      return res.status(400).send("Invalid credentials");
    }

    const user = await User.findOne({ emailId });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      return res.status(400).send("Invalid password");
    }

    console.log("User logged in successfully:", user.emailId);

    //create the jwttoken

    const token = user.getJWT(); // using the method defined in user model to generate token
    console.log("Generated JWT Token:", token);

    // send it to the client

    res.cookie("token", token, {
      expires: new Date(Date.now() + 24 * 3600000),
    });
    res.send({ message: "Login successful", user });
  } catch (err) {
    console.log("Login error:", err.message);
    res.status(500).send("Error logging in user");
  }
});

module.exports=authRouter;