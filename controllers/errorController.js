const AppError = require('./../utils/appError');

const handleCastError = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateError = err => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  console.log(value);
  const message = `duplicate field value: ${value}  please use different value`;
  return new AppError(message, 400);
};

const handleValidateError = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `invalid input data ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = err =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = err =>
  new AppError('Token expire.Please log in again!', 401);

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message
    });
  }
};

const sendErrorProd = (err, req, res) => {
  // Operational error , message to client
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // Logging
    console.error('error ', err);
    //send generic message
    return res.status(500).json({
      status: 'error',
      message: 'something went very wrong'
    });
  }
  //REndered website

  if (err.isOperational) {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message
    });
  } else {
    // Logging
    console.error('error ', err);
    //send generic message
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: 'Please try again later'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
    // } else if (process.env.NODE_ENV === 'production') {
  } else {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    let error = { ...err };
    error.message = err.message;
    if (error.name === 'CastError') error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateError(error);
    if (error.name === 'ValidationError')
      error = handleValidateError(error);
    if (error.name === 'JsonWebTokenError')
      error = handleJWTError(error);
    if (error.name === 'TokenExpiredError')
      error = handleJWTExpiredError(error);
    sendErrorProd(error, req, res);
  }
  next();
};
