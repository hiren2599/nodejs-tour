const express = require('express');
const usercontrollers = require('../controllers/usercontrollers');
const authcontroller = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authcontroller.signUp);

router
  .route('/')
  .get(usercontrollers.getallusers)
  .post(usercontrollers.createuser);

router
  .route('/:id')
  .get(usercontrollers.getoneuser)
  .patch(usercontrollers.updateuser)
  .delete(usercontrollers.deleteuser);

module.exports = router;
