const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const dataSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourrouter = require('./routes/tourroutes');
const userrouter = require('./routes/userroutes');
const reviewrouter = require('./routes/reviewroutes');

const app = express();

//Middlewares

//set security http headers
app.use(helmet());

// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//limit the number of requests
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    'Maximum limit of request is reached,try again after an hour'
});
app.use('/api', limiter);

//Body parser,reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

//DataSanitize against nosql query injections
app.use(dataSanitize());

//Data sanitization from xss
app.use(xss());

//Prevent paramete pollution   eg:=  sort=duration&sort=price
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'price',
      'difficulty',
      'maxGroupSize',
      'ratingsAverage'
    ]
  })
);

//static files
app.use(express.static(`${__dirname}/public`));

//testing middleware
app.use((req, res, next) => {
  console.log('middlleware testing');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toDateString();
  next();
});

// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from server', app: 'tour guide natours' });
// });

// app.post('/', (req, res) => {
//   res.send('hello post the server');
// });

// app.get('/api/v1/tours', getalltour);
// app.get('/api/v1/tours/:id', getonetour);
// app.post('/api/v1/tours', createtour);
// app.patch('/api/v1/tours/:id', updatetour);
// app.delete('/api/v1/tours/:id', deletetour);

// app.use((req, res, next) => {
//   console.log('middlleware testing');
//   next();
// });

//Routes
app.use('/api/v1/tours', tourrouter);
app.use('/api/v1/users', userrouter);
app.use('/api/v1/reviews', reviewrouter);
//server on

app.all('*', (req, res, next) => {
  // const err = new Error(
  //   `The url ${req.originalUrl} is not found on the server`
  // );
  // err.status = 'failed';
  // err.statusCode = 404;
  // next(err);

  next(
    new AppError(
      `The url ${req.originalUrl} is not found on the server`,
      404
    )
  );
});

app.use(globalErrorHandler);
module.exports = app;