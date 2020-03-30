const catchAsync = require('./../utils/catchAsync');
const Tour = require('./../models/tourmodel');
const User = require('./../models/usermodel');
const Booking = require('./../models/bookingmodel');
const AppError = require('./../utils/appError');
// const Review = require('./../models/reviewmodel');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) get tour data
  const tours = await Tour.find();
  // 2) built template

  //3) render the template
  res.status(200).render('overview', {
    title: 'All tour',
    tours: tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1)Get tour data with the guides and review
  const tour = await Tour.findOne({ slug: req.params.slug }).populate(
    {
      path: 'reviews',
      fields: 'ratings review byUser'
    }
  );

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }
  // const review = await Review.find({ forTour: req.params.name });
  // 2)Build template

  // 3)render the template
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour: tour
    // review: review
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
};

exports.getSignUpForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Sign Up'
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account'
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1)find the bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) find tours with the return IDs
  const tourIDs = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours: tours
  });
});

exports.updateUserData = catchAsync(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).render('account', {
    title: 'Your Account',
    user: updatedUser
  });
});
