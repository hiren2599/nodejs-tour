const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/usermodel');
const Email = require('./../utils/email');

const signToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_ON
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() +
        process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    // secure: true,
    httpOnly: true
  };

  user.password = undefined;
  if (process.env.NODE_ENV === 'production')
    cookieOptions.secure = true;
  res.cookie('jwt', token);

  res.status(statusCode).json({
    status: 'success',
    token: token,
    data: {
      user: user
    }
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  createAndSendToken(newUser, 201, res);
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
  createAndSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) getting token and check if it there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
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
  res.locals.user = currentuser;
  req.user = currentuser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  // 1) getting token and check if it there

  if (req.cookies.jwt) {
    try {
      // 2) verification token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 3) check if user still exists
      const currentuser = await User.findById(decoded.id);
      if (!currentuser) {
        return next();
      }

      // 4) if password is changed
      if (currentuser.changesPasswordAt(decoded.iat)) {
        return next();
      }

      //access granted
      res.locals.user = currentuser;
      return next();
    } catch (error) {
      return next();
    }
  }
  next();
};

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

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

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

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) get user from token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresOn: { $gt: Date.now() }
  });

  //2) If token not expired, change password
  if (!user) {
    return next(
      new AppError('Token is invalid or Token is expired', 400)
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresOn = undefined;
  await user.save();

  //3)Update changedPassword property for the user

  //4) log in the user by sending jwt
  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1)Get user from collections
  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return next(new AppError('Not a correct user'));
  }
  // 2) check posted password is correct
  if (
    !(await user.passwordCorrect(
      req.body.passwordCurrent,
      user.password
    ))
  ) {
    return next(new AppError('You current password is wrong', 401));
  }
  // 3)if so ,change the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // 4) Log in with new JWT
  createAndSendToken(user, 200, res);
});
