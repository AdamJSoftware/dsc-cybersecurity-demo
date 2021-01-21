const Post = require("../models/post.model");
const catchAsync = require("../utils/catchAsync");

exports.createPost = catchAsync(async (req, res, next) => {
  const post = await Post.create({ ...req.body });
  res.status(201).json({
    status: "success",
    data: {
      post,
    },
  });
});

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const post = await Post.find();
  res.status(201).json({
    status: "success",

    data: {
      post,
    },
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  res.status(201).json({
    status: "success",
    data: {
      post,
    },
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  // This is redundant but just want to make sure you understand what is going on
  if (req.user.role !== "admin") {
    return next(
      new AppError("You are unauthorized to view this document", 401)
    );
  }
  const { id } = req.params;
  await Post.findByIdAndDelete(id);
  res.status(201).json({
    status: "success",
    data: {},
  });
});
