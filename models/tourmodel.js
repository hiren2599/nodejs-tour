const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./usermodel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      minlength: [10, 'A tour must have name of length 10 minimum'],
      maxlength: [40, 'A tour must have name of length 40 maximum']
      // validate: [validator.isAlpha, 'only characters can be used']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Duration for a tour is needed']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'group size is must for a tour']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        meassage:
          'Choose difficulty between easy,meduim and difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'a tour can have minimum ratings of 1'],
      max: [5, 'a tour can have maximum ratings of 5'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message:
          "The discount price({VALUE}) can't be more than price"
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a imagecover']
    },
    images: {
      type: [String]
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: {
      type: [Date]
    },
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationweeks').get(function() {
  return this.duration / 7;
});

//Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'forTour',
  localField: '_id'
});

//Document middleware .save() and .create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name);
  next();
});

//For embedding method tour model and user model for tour guides
// tourSchema.pre('save', async function(next) {
//   const guidepromise = this.guides.map(
//     async id => await User.findById(id)
//   );
//   this.guides = await Promise.all(guidepromise);

//   next();
// });

// tourSchema.pre('save', function(next) {
//   console.log('will be saved to database');
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

//Query middleware

tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(
    `this query took time = ${Date.now() - this.start} milliseconds`
  );
  // console.log(docs);
  next();
});

//Agregation middleware
// tourSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this.pipeline());
//   next();
// });
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
