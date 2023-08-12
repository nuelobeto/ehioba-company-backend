const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const { requiresAuth } = require("../middlewares/authMiddleware");

const {
  addPost,
  getPosts,
  updatePost,
  deletePost,
} = require("../controllers/postControllers");

router.post("/addPost", requiresAuth, upload.single("image"), addPost);
router.get("/getPosts", requiresAuth, getPosts);
router.put("/updatePost/:id", requiresAuth, upload.single("image"), updatePost);
router.delete("/deletePost/:id", requiresAuth, deletePost);

module.exports = router;
