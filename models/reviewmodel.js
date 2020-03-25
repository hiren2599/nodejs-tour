const mongoose = require('mongoose');
const Tour = require('./tourmodel');

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

reviewSchema.index({ forTour: 1, byUser: 1 }, { unique: true });

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

reviewSchema.statics.calcAverageRatings = async function(tourId) {
  // console.log(tourId);
  const stats = await this.aggregate([
    {
      $match: { forTour: tourId }
    },
    {
      $group: {
        _id: '$forTour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$ratings' }
      }
    }
  ]);
  console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating * 1,
      ratingsQuantity: stats[0].nRatings
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0
    });
  }
};

reviewSchema.post('save', function() {
  this.constructor.calcAverageRatings(this.forTour);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.result = await this.findOne();
  console.log(this.result);
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  await this.result.constructor.calcAverageRatings(
    this.result.forTour
  );
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
