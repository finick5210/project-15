const jwt = require('jsonwebtoken');
const { AuthorizationError } = require('../errors');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  const message = 'Authorization is required';

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new AuthorizationError(message));
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    const { JWT_SECRET } = process.env;
    payload = jwt.verify(token, JWT_SECRET || 'dev_secret');
  } catch (err) {
    return next(new AuthorizationError(message));
  }

  req.user = payload;

  return next();
};
