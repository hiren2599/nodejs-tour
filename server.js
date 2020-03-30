const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  //Synchronous
  // console.log(err.name, err.message);
  console.log('uncaught exception so closing down the server');
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');
//  console.log(process.env);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('database successfully connected'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('The server is running on the port number 3000');
  console.log(process.env.NODE_ENV);
});

process.on('unhandledRejection', err => {
  //Asynchronous handled
  console.log(err.name, err.message);
  console.log('unhandled exception so closing down the server');
  server.close(() => {
    //use server.close() as it gives time to server to shut down
    process.exit(1);
  });
});

process.on('SIGNTERM', () => {
  console.log('shutting down as signterm received');
  server.close(() => {
    console.log('Process terminated');
  });
});
