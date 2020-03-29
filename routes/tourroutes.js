const express = require('express');
const authcontrollers = require('./../controllers/authController');
const tourcontrollers = require('../controllers/tourcontrollers');
const reviewRouter = require('./../routes/reviewroutes');

const router = express.Router();

// router.param('id', tourcontrollers.checkid);

router.use('/:tourId/reviews', reviewRouter);

router.route('/tour-stats').get(tourcontrollers.tourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authcontrollers.protect,
    authcontrollers.restrictTo('admin', 'lead-guide'),
    tourcontrollers.getMonthlyPlan
  );

router
  .route(
    '/tours-within/:distance/center/:latlng/unit/:unit' // tour-within?distance=5&latlan=-40,45&unit=5
  )
  .get(tourcontrollers.getToursWithin);

router
  .route('/distances/:latlng/unit/:unit')
  .get(tourcontrollers.getDistances);

router
  .route('/top-5-cheap')
  .get(tourcontrollers.aliasTopfive, tourcontrollers.getalltour);

router
  .route('/')
  .get(tourcontrollers.getalltour)
  .post(
    authcontrollers.protect,
    authcontrollers.restrictTo('admin', 'lead-guide'),
    tourcontrollers.createtour
  );

router
  .route('/:id')
  .get(tourcontrollers.getonetour)
  .patch(
    authcontrollers.protect,
    authcontrollers.restrictTo('admin', 'lead-guide'),
    tourcontrollers.uploadTourImages,
    tourcontrollers.resizeTourImages,
    tourcontrollers.updatetour
  )
  .delete(
    authcontrollers.protect,
    authcontrollers.restrictTo('admin', 'lead-guide'),
    tourcontrollers.deletetour
  );

// router
//   .route('/:tourId/reviews')
//   .post(
//     authcontrollers.protect,
//     authcontrollers.restrictTo('user'),
//     reviewcontrollers.createReview
//   );

module.exports = router;
