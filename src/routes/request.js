const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const { toUserId, status } = req.params;
      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).send("Invalid status type: " + status);
      }

      // fetch to user id is prsent in the databse or not
      const toUser=await User.findById(toUserId);
      if(!toUser){
        return res.status(404).send("The user you are trying to connect with does not exist");
      } 

      

      // if there is a existing connection request
      const existingConnectionaRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionaRequest) {
        return res
          .status(400)
          .send("A connection request already exists between these users");
      }
      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      console.log("Connection request sent successfully:", data);

      res.json({
        message: "Connection request sent successfully",
        data,
      });
    } catch (err) {
      console.log("Error sending connection request:", err.message);
      res.status(500).send("Error sending connection request");
    }
  },
);
module.exports = requestRouter;
