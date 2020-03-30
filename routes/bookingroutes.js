const express = require('express');
const bookingControllers = require('./../controllers/bookingController');
const authControllers = require('./../controllers/authController');

const router = express.Router();

router.use(authControllers.protect);

router.get(
  '/checkout-session/:tourId',
  bookingControllers.getCheckoutSession
);

router.use(authControllers.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingControllers.getAllBooking)
  .post(bookingControllers.createBooking);

router
  .route('/:id')
  .get(bookingControllers.getBooking)
  .patch(bookingControllers.updateBooking)
  .delete(bookingControllers.deleteBooking);

module.exports = router;
