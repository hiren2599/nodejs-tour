const express = require('express');
const reviewControllers = require('./../controllers/reviewcontroller');
const authControllers = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authControllers.protect);
router
  .route('/')
  .get(reviewControllers.getAllReview)
  .post(
    authControllers.restrictTo('user'),
    reviewControllers.setTourUserIds,
    reviewControllers.createReview
  );

router
  .route('/:id')
  .get(reviewControllers.getReview)
  .patch(
    authControllers.restrictTo('admin', 'user'),
    reviewControllers.updateReview
  )
  .delete(
    authControllers.restrictTo('admin', 'user'),
    reviewControllers.deleteReview
  );

module.exports = router;
