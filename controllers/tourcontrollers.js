const Tour = require('./../models/tourmodel');
const ApiFeature = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

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

//After Mongoose

exports.aliasTopfive = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,ratingsAverage,summary,difficulty';
  next();
};

exports.getalltour = catchAsync(async (req, res, next) => {
  console.log(req.query);

  // const query = Tour.find()
  //   .where('duration')
  //   .equals(5)
  //   .where('difficulty')
  //   .equals('easy');

  // Execute query

  const features = new ApiFeature(Tour.find(), req.query)
    .filter()
    .sort()
    .limit()
    .paginate();
  // console.log(features.query);
  const tours = await features.query;
  res.status(200).json({
    message: 'success',
    requestedAt: req.requestTime,
    result: tours.length,
    data: {
      tours: tours
    }
  });
});

exports.getonetour = catchAsync(async (req, res, next) => {
  const tours = await Tour.findById(req.params.id).populate(
    'reviews'
  );

  if (!tours) {
    return next(
      new AppError("The tour with the id doesn't exist"),
      404
    );
  }

  res.status(200).json({
    message: 'success',
    requestedAt: req.requestTime,
    data: {
      tours: tours
    }
  });

  // const id = parseInt(req.params.id);
  // const find_tour = tours.find(el => el.id === id);
  // res.status(200).json({
  //   message: 'success',
  //   data: {
  //     tour: find_tour
  //   }
  // });
});

exports.createtour = catchAsync(async (req, res, next) => {
  const newtour = await Tour.create(req.body);
  res.status(201).json({
    message: 'created',
    data: {
      tours: newtour
    }
  });
});

exports.updatetour = catchAsync(async (req, res, next) => {
  const tours = await Tour.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!tours) {
    return next(
      new AppError("The tour with the id doesn't exist"),
      404
    );
  }
  res.status(200).json({
    message: 'success',
    data: {
      tours: tours
    }
  });
});

exports.deletetour = catchAsync(async (req, res, next) => {
  const tours = await Tour.findByIdAndDelete(req.params.id);

  if (!tours) {
    return next(
      new AppError("The tour with the id doesn't exist"),
      404
    );
  }
  res.status(204).json({
    message: 'success',
    data: {
      tour: null
    }
  });
});

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
