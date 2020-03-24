const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Reviw is must']
    },
    ratings: {
      type: Number,
      min: [1, 'The number must be more that 1'],
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    forTour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'The reviw must have a tour']
    },
    byUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'The review writteln by user is must']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.pre(/^find/, function(next) {
  //   this.populate({
  //     path: 'forTour',
  //     select: 'name'
  //   }).populate({
  //     path: 'byUser',
  //     select: 'name photo'
  //   });

  this.populate({
    path: 'byUser',
    select: 'name photo'
  });

  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
