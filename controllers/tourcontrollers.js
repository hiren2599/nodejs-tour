const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourmodel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./../controllers/handlerFactory');

// Before Mongoose

//

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkid = (req, res, next, val) => {
//    if (req.params.id > tours.length) {
//      return res
//       .status(404)
//        .json({ message: 'invalid id', status: 'Not found' });
//    }

//   next();
// };
// exports.getalltour = (req, res) => {
//   res.status(200).json({
//     message: 'success',
//     requestedAt: req.requestTime
//     // result: tours.length,
//     // data: {
//     //   tours: tours
//     // }
//   });
// };

// exports.getonetour = (req, res) => {
//   // const id = parseInt(req.params.id);
//   // const find_tour = tours.find(el => el.id === id);
//   // res.status(200).json({
//   //   message: 'success',
//   //   data: {
//   //     tour: find_tour
//   //   }
//   // });
// };

// exports.checkbody = (req, res, next) => {
//   // console.log(req.body.name);
//   if (req.body.name === undefined || req.body.price === undefined) {
//     return res.status(400).json({
//       message: "request can't be processed due insufficient data",
//       status: 'bad request'
//     });
//   }
//   next();
// };

// exports.createtour = (req, res) => {
// console.log(req.body);
// const newid = tours[tours.length - 1].id + 1;
// const newtour = Object.assign({ id: newid }, req.body);
// tours.push(newtour);
// fs.writeFile(
//   `${__dirname}/dev-data/data/tours-simple.json`,
//   JSON.stringify(tours),
//   err => {
//     res.status(201).json({
//       message: 'created',
//       data: {
//         tours: newtour
//       }
//     });
//   }
// );
// };

// exports.updatetour = (req, res) => {
//   res.status(200).json({
//     message: 'success',
//     data: {
//       tour: 'Updated tours will be here'
//     }
//   });
// };

// exports.deletetour = (req, res) => {
//   res.status(204).json({
//     message: 'success',
//     data: {
//       tour: null
//     }
//   });
// };

//

const multerStorage = multer.memoryStorage(); //Saves as buffer

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image , upload a image', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

// upload.single('image');  req.file
// upload.array('image', 5); req.files

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) imageCover
  req.body.imageCover = `tour-${
    req.params.id
  }-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) images
  req.files.images.foreach(async (file, ind) => {
    const filename = `tour-${
      req.params.id
    }-${Date.now()}-${ind}.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${filename}`);
  });

  next();
});

//After Mongoose

exports.aliasTopfive = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,ratingsAverage,summary,difficulty';
  next();
};

exports.getalltour = factory.getAll(Tour);
exports.getonetour = factory.getOne(Tour, { path: 'reviews' });

// const id = parseInt(req.params.id);
// const find_tour = tours.find(el => el.id === id);
// res.status(200).json({
//   message: 'success',
//   data: {
//     tour: find_tour
//   }
// });

exports.createtour = factory.createOne(Tour);
exports.updatetour = factory.updateOne(Tour);
exports.deletetour = factory.deleteOne(Tour);
// exports.deletetour = catchAsync(async (req, res, next) => {
//   const tours = await Tour.findByIdAndDelete(req.params.id);

//   if (!tours) {
//     return next(
//       new AppError("The tour with the id doesn't exist"),
//       404
//     );
//   }
//   res.status(204).json({
//     message: 'success',
//     data: {
//       tour: null
//     }
//   });
// });

exports.tourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);
  res.status(200).json({
    message: 'success',
    data: {
      stats: stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStart: { $sum: 1 },
        tourName: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: { _id: 0 }
    },
    {
      $sort: { numTourStart: -1 }
    },
    {
      $limit: 12
    }
  ]);
  res.status(200).json({
    message: 'success',
    data: {
      plan: plan
    }
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius =
    unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format let,lang',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] }
    }
  });

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      data: tours
    }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format let,lang',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    result: distances.length,
    data: {
      data: distances
    }
  });
});
