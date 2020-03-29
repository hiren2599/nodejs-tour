const express = require('express');
const usercontrollers = require('../controllers/usercontrollers');
const authcontroller = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authcontroller.signUp);
router.post('/login', authcontroller.login);
router.get('/logout', authcontroller.logout);
router.post('/forgotPassword', authcontroller.forgotPassword);
router.patch('/resetPassword/:token', authcontroller.resetPassword);

router.use(authcontroller.protect);
router.patch('/updateMyPassword', authcontroller.updatePassword);

router.get('/me', usercontrollers.getMe, usercontrollers.getoneuser);
router.patch(
  '/updateMe',
  usercontrollers.updateUserPhoto,
  usercontrollers.resizeUserPhoto,
  usercontrollers.updateMe
);

router.delete('/deleteMe', usercontrollers.deleteMe);

router.use(authcontroller.restrictTo('admin'));
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
