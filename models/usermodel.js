const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//Fat models thin controller

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please enter a name']
    },
    password: {
      type: String,
      required: [true, 'enter a password'],
      minlength: 8,
      select: false
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
    role: {
      type: String,
      enum: ['user', 'admin', 'guide', 'lead-guide'],
      default: 'user'
    },
    email: {
      type: String,
      required: [true, 'Please enter the email address'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please enter a valid email']
    },
    photo: {
      type: String,
      default: 'default.jpg'
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpiresOn: Date,
    active: {
      type: Boolean,
      default: true,
      select: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.pre('save', async function(next) {
  //only excuted when password is modified
  if (!this.isModified('password')) return next();

  //hashing
  this.password = await bcrypt.hash(this.password, 12);
  //deleting the passwordconfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('passwrod') || this.isNew) {
    return next();
  }

  this.passwordChangedAt = Date.now() - 1000; //It takes time to change so sub 1sec
  next();
});

userSchema.pre(/^find/, function(next) {
  //Query middleware
  this.find({ active: { $ne: false } });
  next();
});

// instance method
userSchema.methods.passwordCorrect = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changesPasswordAt = function(JWTTimeStamp) {
  if (this.passwordChangedAt) {
    // eslint-disable-next-line radix
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000
    );
    return JWTTimeStamp < changedTimeStamp;
  }

  // no password changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpiresOn = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
