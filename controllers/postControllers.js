const asyncHandler = require("express-async-handler");
const Post = require("../models/postModel");
const cloudinary = require("../middlewares/cloudinary");

const addPost = asyncHandler(async (req, res) => {
  const { title, category, content, author } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error("Please upload a post image");
  }

  if (!title || !category || !content || !author) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  const existingPost = await Post.findOne({
    title: new RegExp("^" + title + "$", "i"),
  });

  if (existingPost) {
    res.status(400);
    throw new Error("Post already exists");
  }

  const image = await cloudinary.uploader.upload(req.file.path, {
    folder: "ehioba",
  });

  const post = await Post.create({
    title,
    category,
    content,
    author,
    image: image.secure_url,
  });

  res.status(201).json({
    id: post.id,
    title: post.title,
    category: post.category,
    content: post.content,
    author: post.author,
    image: post.image,
    date: post.createdAt,
  });
});

const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find();
  res.status(200).json(
    posts.map((post) => {
      return {
        id: post.id,
        title: post.title,
        category: post.category,
        content: post.content,
        author: post.author,
        image: post.image,
        date: post.createdAt,
      };
    })
  );
});

const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  const { title, category, content, author } = req.body;
  let image;

  if (!req.file) {
    image = post.image;
  } else {
    const image_url = post.image.split("/");
    const publicId = image_url[image_url.length - 1].split(".")[0];
    await cloudinary.uploader.destroy(`ehioba/${publicId}`);
    image = await cloudinary.uploader.upload(req.file.path, {
      folder: "ehioba",
    });
  }

  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      title,
      category,
      image: req.file ? image.secure_url : image,
      content,
      author,
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    id: updatedPost.id,
    title: updatedPost.title,
    category: updatedPost.category,
    content: updatedPost.content,
    author: updatedPost.author,
    image: updatedPost.image,
    date: updatedPost.createdAt,
  });
});

const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  const image_url = post.image.split("/");
  const publicId = image_url[image_url.length - 1].split(".")[0];
  await cloudinary.uploader.destroy(`ehioba/${publicId}`);
  res.status(200).json(post);
});

module.exports = {
  addPost,
  getPosts,
  updatePost,
  deletePost,
};
