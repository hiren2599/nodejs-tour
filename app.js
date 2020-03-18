const express = require('express');
const morgan = require('morgan');
const tourrouter = require('./routes/tourroutes');
const userrouter = require('./routes/userroutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

//Middlewares
// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use(express.static(`${__dirname}/public`));
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
