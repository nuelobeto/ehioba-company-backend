const express = require("express");
const router = express.Router();

const {
  register,
  login,
  resetPassword,
} = require("../controllers/userControllers");

router.post("/register", register);
router.post("/login", login);
router.put("/reset-password", resetPassword);

module.exports = router;
