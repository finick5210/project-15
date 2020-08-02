const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const {
  AuthorizationError,
} = require('../errors');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
    trim: true,
    validate: {
      validator(about) {
        return !validator.isEmpty(about);
      },
      message: (props) => `${props.value} is not a valid name!`,
    },
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
    validate: {
      validator(about) {
        return !validator.isEmpty(about);
      },
      message: (props) => `${props.value} is not a valid about field!`,
    },
  },
  avatar: {
    type: String,
    required: true,
    validate: {
      validator(link) {
        return validator.isURL(link);
      },
      message: (props) => `${props.value} is not a valid url!`,
    },
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator(email) {
        return validator.isEmail(email);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
    unique: true,
  },
  password: {
    type: String,
    minlength: 4,
    required: true,
    select: false,
    trim: true,
  },
});

// eslint-disable-next-line
userSchema.statics.findUserByCredentials = function (email, password) {
  const message = 'Incorrect email or password';
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new AuthorizationError(message));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new AuthorizationError(message));
          }

          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
