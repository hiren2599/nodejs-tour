const User = require('./../models/usermodel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./../controllers/handlerFactory');

const filterObj = (obj, ...allowedfields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedfields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1)if user wants to update password he/she can't
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "You can't update password here. Use /updateMyPassword",
        400
      )
    );
  }

  //2) Update the user document
  const filteredBody = filterObj(req.body, 'name', 'email'); //Only filtered things can be updated
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getallusers = factory.getAll(User);
exports.getoneuser = factory.getOne(User);

exports.createuser = (req, res) => {
  res.status(500).json({ message: 'not implemented.Use /signUp' });
};

exports.deleteuser = factory.deleteOne(User);

exports.updateuser = factory.updateOne(User);
