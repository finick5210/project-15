const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const {
  NotFoundError, ValidationError, ServerError, AuthorizationError,
} = require('../errors');

module.exports.getUsers = (req, res, next) => {
  User.find()
    .then((users) => res.send({ data: users }))
    .catch((err) => next(new ServerError(err.message)));
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!password || password.trim().length === 0) {
    next(new ValidationError('Password should not be empty'));
  }

  if (password.length < 4 || password.length > 30) {
    next(new ValidationError('Password must be longer than 4 characters and less then 30'));
  }

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then(() => res.send({
      name,
      about,
      avatar,
      email,
    }))
    .catch((err) => {
      next(err.name === 'ValidationError' ? new ValidationError(err.message) : new ServerError(err.message));
    });
};

module.exports.getUser = (req, res, next) => {
  const { id } = req.params;
  User.findById(id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      res.send({ data: user });
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const { NODE_ENV, JWT_SECRET } = process.env;

      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );

      res
        .cookie('token', token, {
          httpOnly: true,
          maxAge: 3600000 * 24 * 7,
        });

      return res.send({ token });
    })
    .catch((err) => next(new AuthorizationError(err.message)));
};
