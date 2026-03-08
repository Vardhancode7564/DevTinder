const validator = require("validator");
const validateSignupData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("First Name and Last Name are required.");
  }

  if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid.");
  }

  if (!validator.isStrongPassword(password)) {
    throw new Error(
      "Password must contain uppercase, lowercase, number and symbol.",
    );
  }
};

const validateProfileData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "about",
    "skills",
    "photoUrl",
  ];

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );

  return isEditAllowed;
};

module.exports = { validateSignupData, validateProfileData };
