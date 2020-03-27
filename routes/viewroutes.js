const express = require('express');
const viewControllers = require('./../controllers/viewController');
const authControllers = require('./../controllers/authController');

const router = express.Router();

router.get('/', viewControllers.getOverview);
router.get(
  '/tour/:slug',
  authControllers.protect,
  viewControllers.getTour
);
router.get('/login', viewControllers.getLoginForm);
router.get('/signup', viewControllers.getSignUpForm);

module.exports = router;
