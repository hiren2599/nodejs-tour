const User = require('./../models/usermodel');
const catchAsync = require('./../utils/catchAsync');

exports.getallusers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    message: 'success',
    requestedAt: req.requestTime,
    result: users.length,
    data: {
      users: users
    }
  });
});

exports.getoneuser = (req, res) => {
  res.status(500).json({ message: 'not implemented' });
};

exports.createuser = (req, res) => {
  res.status(500).json({ message: 'not implemented' });
};

exports.deleteuser = (req, res) => {
  res.status(500).json({ message: 'not implemented' });
};

exports.updateuser = (req, res) => {
  res.status(500).json({ message: 'not implemented' });
};
