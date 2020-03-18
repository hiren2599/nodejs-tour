const express = require('express');
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
  .get(tourcontrollers.getalltour)
  .post(tourcontrollers.createtour);

router
  .route('/:id')
  .get(tourcontrollers.getonetour)
  .patch(tourcontrollers.updatetour)
  .delete(tourcontrollers.deletetour);

module.exports = router;
