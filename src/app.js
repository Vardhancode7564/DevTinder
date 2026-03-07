const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/database");
const User = require("./models/user");
const { validateSignupData } = require("./utils/validation");
const { userAuth } = require("./middleware/auth");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
// Load environment variables immediately
dotenv.config();
app.use(express.json());
app.use(cookieParser());
/* ===================== SIGNUP ===================== */
app.post("/signup", async (req, res) => {
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

/* ===================== GET USER BY EMAIL ===================== */

app.get("/user", userAuth, async (req, res) => {
  const userEmail = req.query.emailId;

  try {
    const user = await User.findOne({ emailId: userEmail }).select("-password");

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.send(user);
  } catch (err) {
    console.log("Error fetching user:", err.message);
    res.status(500).send("Error fetching user");
  }
});

/* ===================== FEED ===================== */

app.get("/feed", userAuth, async (req, res) => {
  try {
    const users = await User.find({}).select("-password");

    res.send(users);
  } catch (err) {
    console.log("Error fetching users:", err.message);
    res.status(500).send("Error fetching users");
  }
});

/* ===================== DELETE USER BY ID ===================== */

app.delete("/user", userAuth, async (req, res) => {
  const userId = req.body.userId;

  try {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.send("User deleted successfully");
  } catch (err) {
    console.log("Error deleting user:", err.message);
    res.status(500).send("Error deleting user");
  }
});

/* ===================== UPDATE USER ===================== */

app.patch("/user/:userId", async (req, res) => {
  const userId = req.params.userId;
  const data = req.body;

  try {
    const allowedUpdates = ["gender", "photoUrl", "about", "skills", "age"];

    const isUpdateAllowed = Object.keys(data).every((key) =>
      allowedUpdates.includes(key),
    );

    if (!isUpdateAllowed) {
      throw new Error(
        "Update not allowed! Allowed fields: " + allowedUpdates.join(", "),
      );
    }

    if (data?.skills && data.skills.length > 15) {
      throw new Error("You can add up to 15 skills only.");
    }

    const user = await User.findByIdAndUpdate(userId, data, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.send(user);
  } catch (err) {
    console.log("Error updating user:", err.message);
    res.status(500).send(err.message);
  }
});

/* ===================== DELETE USER BY EMAIL ===================== */

app.delete("/user/:emailId", async (req, res) => {
  const userEmail = req.params.emailId;

  try {
    const user = await User.findOneAndDelete({ emailId: userEmail });

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.send("User deleted successfully");
  } catch (err) {
    console.log("Error deleting user:", err.message);
    res.status(500).send("Error deleting user");
  }
});

/* ===================== LOGIN ===================== */

app.post("/login", async (req, res) => {
  try {
    const{emailId,password}=req.body;

    if (!emailId||!password) {
      return res.status(400).send("Invalid credentials");
    }

    const user=await User.findOne({ emailId });

    if(!user){
      return res.status(404).send("User not found");
    }

    const isPasswordValid=await user.validatePassword(password);

    if(!isPasswordValid){
      return res.status(400).send("Invalid password");
    }

    console.log("User logged in successfully:", user.emailId);

    //create the jwttoken

    const token =user.getJWT(); // using the method defined in user model to generate token
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

// profile route to get user details using jwt token
app.get("/profile", userAuth, async (req, res) => {
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

// sending connection Request
app.post("/sendConnectionRequest", userAuth, async (req, res) => {
  const user = req.user; // authenticated user details from token
  //sending connection request from one user to another
  console.log("Sending the connection request");

  res.send(user.firstName + " sent Request successfully");
});
connectDB()
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");

    app.listen(3000, () => {
      console.log("📡 Server running on port: 3000");
    });
  })
  .catch((err) => {
    console.log("📡 Database connection error:❌ ", err);
  });
