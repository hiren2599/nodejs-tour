const catchAsync = require('./../utils/catchAsync');
const ApiFeature = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const docs = await Model.findByIdAndDelete(req.params.id);

    if (!docs) {
      return next(
        new AppError("The document with the id doesn't exist"),
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

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!doc) {
      return next(
        new AppError("The document with the id doesn't exist"),
        404
      );
    }
    res.status(200).json({
      message: 'success',
      data: {
        data: doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      message: 'created',
      data: {
        data: doc
      }
    });
  });

exports.getOne = (Model, PopulateOpts) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (PopulateOpts) query = query.populate(PopulateOpts);
    const doc = await query;

    if (!doc) {
      return next(
        new AppError("The document with the id doesn't exist"),
        404
      );
    }

    res.status(200).json({
      message: 'success',
      requestedAt: req.requestTime,
      data: {
        data: doc
      }
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // console.log(req.query);

    let filter = {};
    if (req.params.tourId) filter = { forTour: req.params.tourId };
    const features = new ApiFeature(Model.find(filter), req.query)
      .filter()
      .sort()
      .limit()
      .paginate();
    // console.log(features.query);

    // const doc = await features.query.explain();
    const doc = await features.query;
    res.status(200).json({
      message: 'success',
      requestedAt: req.requestTime,
      result: doc.length,
      data: {
        data: doc
      }
    });
  });
