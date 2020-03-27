const catchAsync = require('./../utils/catchAsync');
const Tour = require('./../models/tourmodel');
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
