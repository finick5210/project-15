const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find()
    .then((users) => res.send({ data: users }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

module.exports.createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!password || password.trim().length === 0) {
    res.status(400).send({ message: 'Password should not be empty' });
    return;
  }

  if (password.length < 4 || password.length > 30) {
    res.status(400).send({ message: 'Password must be longer than 4 characters and less then 30' });
    return;
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
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: err.message });
        return;
      }
      res.status(500).send({ message: err.message });
    });
};

module.exports.getUser = (req, res) => {
  const { id } = req.params;
  User.findById(id)
    .then((user) => {
      if (!user) {
        res.status('404');
        res.send({ message: 'Нет пользователя с таким id' });
        return;
      }
      res.send({ data: user });
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const { JWT_SECRET } = process.env;

      const token = jwt.sign(
        // eslint-disable-next-line no-underscore-dangle
        { _id: user._id },
        JWT_SECRET || 'dev_secret',
        { expiresIn: '7d' },
      );

      res
        .cookie('token', token, {
          httpOnly: true,
          maxAge: 3600000 * 24 * 7,
        });

      return res.send({ token });
    })
    .catch((err) => {
      res
        .status(401)
        .send({ message: err.message });
    });
};
