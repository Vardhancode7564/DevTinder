const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please provide your First Name"],
      minlength: 3,
      maxlength: 50,
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, "Please provide your Last Name"],
      minlength: 4,
      maxlength: 50,
      trim: true,
    },

    emailId: {
      type: String,
      lowercase: true,
      required: [true, "Please Provide your Email Id"],
      unique: true,
      trim: true,
      validate: {
        validator: function (value) {
          return validator.isEmail(value);
        },
        message: "Email is not valid.",
      },
    },

    password: {
      type: String,
      required: [true, "Please provide your Password"],
      minlength: 6,
      validate: {
        validator: function (value) {
          return validator.isStrongPassword(value);
        },
        message: "Password is not strong enough",
      },
    },

    age: {
      type: Number,
      min: 18,
      required: [true, "Please provide your Age"],
    },

    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: `{VALUE} is not a valid gender type`,
      },
      required: [true, "Please provide your Gender"],
    },

    photoUrl: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
      validate: {
        validator: (value) => validator.isURL(value),
        message: "Photo URL is not valid.",
      },
    },

    about: {
      type: String,
      maxlength: 300,
    },

    skills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);


userSchema.methods.getJWT = function () {
  const user = this; // current user document dont use arrow function here to access the user document using this keyword
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this; // dont use arrow function here to access the user document using this keyword
  const passwordHashed = user.password;
  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHashed,
  );

  return isPasswordValid;
};

module.exports = mongoose.model("User", userSchema);
