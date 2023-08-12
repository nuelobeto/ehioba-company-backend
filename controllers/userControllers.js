const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  const existingUser = await User.findOne({
    email: new RegExp("^" + email + "$", "i"),
  });

  if (existingUser) {
    res.status(400);
    throw new Error("User already exist");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    email,
    password: hashedPassword,
  });

  res.status(201).json({
    id: user.id,
    email: user.email,
    token: generateToken(user.id),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email: new RegExp("^" + email + "$", "i"),
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid Credentials");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    res.status(400);
    throw new Error("Invalid Credentials");
  }

  res.status(200).json({
    id: user.id,
    email: user.email,
    token: generateToken(user.id),
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const updatedUser = await User.findOneAndUpdate(
    {
      email,
    },
    {
      password: hashedPassword,
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    id: updatedUser.id,
    email: updatedUser.email,
    token: generateToken(updatedUser.id),
  });
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

module.exports = {
  register,
  login,
  resetPassword,
};
