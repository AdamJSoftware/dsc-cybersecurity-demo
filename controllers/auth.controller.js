const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // Cookie only sent on encrypted connection
    // secure: true,
    // Cookie cannot be accessed or modified in anyway by the browser
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove the password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.register = catchAsync(async (req, res, next) => {
  console.log(req.body);
  let newUser;
  newUser = await User.create({
    ...req.body,
  });

  createSendToken(newUser, 201, res);
});

exports.admin = catchAsync(async (req, res, next) => {
  if (req.user.role === "admin") {
    res.status(201).json({
      status: "success",
    });
  }
  res.status(401).json({
    status: "failure",
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  //1) check if username and password exist
  if (!username || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  //2)Check if user exists && password is correct
  const user = await User.findOne({ username }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    // avoids giving attackers specific details
    return next(new AppError("Incorrect email or password", 401));
  }

  //3) If everything is okay, send token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    return next(
      new AppError("You are not logged in! Please log in to get access"),
      401
    );
  }

  // 2) Token verification
  // 2nd part calls the function
  // 1st part stores the promise
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token does no longer exist"),
      401
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

//creates an array of all the arguments we are specifying which return a middleware
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles []
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};
