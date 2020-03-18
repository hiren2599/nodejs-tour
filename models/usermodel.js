const mongoose = require('mongoose');
const validator = require('validator');

//Fat models thin controller

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please enter a name']
  },
  password: {
    type: String,
    required: [true, 'enter a password'],
    minlength: 8
  },
  passwordConfirm: {
    type: String,
    required: [true, 'enter the confirm password'],
    validate: {
      //This validator works only when saving(creating) the user
      validator: function(el) {
        return el === this.password;
      },
      message: 'The passwords are not same'
    }
  },
  email: {
    type: String,
    required: [true, 'Please enter the email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email']
  },
  photo: {
    type: String
  }
});

userSchema.pre('save', function(next) {});

const User = mongoose.model('User', userSchema);
module.exports = User;
