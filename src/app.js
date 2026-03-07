const express = require("express");
const app = express();

const connectDB = require("./config/database");
const User = require("./models/user");

const { userAuth } = require("./middleware/auth");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
// Load environment variables immediately
dotenv.config();
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");  

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter); 


app.get("/user", userAuth, async (req, res) => {
  const userEmail = req.query.emailId;

  try {
    const user = await User.findOne({ emailId: userEmail }).select("-password");

    if (!user) {
      return res.status(404).send("User not found");
    }
    console.log("User found:", user.emailId);
    console.log("User details sent to client:", user);
    res.send(user);
  } catch (err) {
    console.log("Error fetching user:", err.message);
    res.status(500).send("Error fetching user");
  }
});



app.get("/feed", userAuth, async (req, res) => {
  try {
    const users = await User.find({}).select("-password");

    res.send(users);
  } catch (err) {
    console.log("Error fetching users:", err.message);
    res.status(500).send("Error fetching users");
  }
});



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



app.patch("/user/:userId", userAuth, async (req, res) => {
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

 

app.delete("/user/:emailId", userAuth, async (req, res) => {
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
