const express = require('express');
const reviewControllers = require('./../controllers/reviewcontroller');
const authControllers = require('./../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(reviewControllers.getAllReview)
  .post(
    authControllers.protect,
    authControllers.restrictTo('user'),
    reviewControllers.createReview
  );

module.exports = router;
