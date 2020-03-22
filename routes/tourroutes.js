const express = require('express');
const authcontrollers = require('./../controllers/authController');
const tourcontrollers = require('../controllers/tourcontrollers');

const router = express.Router();

// router.param('id', tourcontrollers.checkid);

router.route('/tour-stats').get(tourcontrollers.tourStats);
router
  .route('/monthly-plan/:year')
  .get(tourcontrollers.getMonthlyPlan);

router
  .route('/top-5-cheap')
  .get(tourcontrollers.aliasTopfive, tourcontrollers.getalltour);

router
  .route('/')
  .get(authcontrollers.protect, tourcontrollers.getalltour)
  .post(tourcontrollers.createtour);

router
  .route('/:id')
  .get(tourcontrollers.getonetour)
  .patch(tourcontrollers.updatetour)
  .delete(
    authcontrollers.protect,
    authcontrollers.restrictTo('admin'),
    tourcontrollers.deletetour
  );

module.exports = router;
