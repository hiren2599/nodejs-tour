const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/usermodel');
const sendEmail = require('./../utils/email');

const signToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_ON
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'created',
    token,
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) If email and password is entered
  if (!email || !password) {
    return next(
      new AppError('Please provide email and password', 400)
    );
  }

  //2) get password and email
  const user = await User.findOne({ email: email }).select(
    '+password'
  );

  // 3) Check if password is correct and user exists
  if (
    !user ||
    !(await user.passwordCorrect(password, user.password))
  ) {
    return next(
      new AppError('Please enter valid email or password', 401)
    );
  }

  // 4) SENDING Token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token: token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) getting token and check if it there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in,please log in', 401)
    );
  }

  // 2) verification token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // 3) check if user still exists
  const currentuser = await User.findById(decoded.id);
  if (!currentuser) {
    return next(
      new AppError('The user with token does not exist', 401)
    );
  }

  // 4) if password is changed
  if (currentuser.changesPasswordAt(decoded.iat)) {
    return next(
      new AppError('The password is changed so login again', 401)
    );
  }

  //access granted
  req.user = currentuser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permissions', 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) get user for the email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('The email is not correct', 404));
  }
  //2) generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3) send it to it's user email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a patch request with new password and confirm to: ${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'The reset password token valid for 10 min',
      message: message
    });

    res.status(200).json({
      status: 'success',
      message: "Reset password token sent thro' email"
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiresOn = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Error while sending a mail.try again'));
  }
});

exports.resetPassword = (req, res, next) => {};
