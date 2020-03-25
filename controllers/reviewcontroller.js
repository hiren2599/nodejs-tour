const Review = require('./../models/reviewmodel');
const factory = require('./../controllers/handlerFactory');
// const catchAsync = require('./../utils/catchAsync');

exports.setTourUserIds = (req, res, next) => {
  //Allowing nested routes
  if (!req.body.tour) req.body.forTour = req.params.tourId;
  if (!req.body.user) req.body.byUser = req.user.id;
  next();
};

exports.getAllReview = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
