const AuthorizationError = require('./authorization-error');
const NotFoundError = require('./not-found-error');
const ValidationError = require('./validation-error');
const ServerError = require('./server-error');

module.exports = {
  AuthorizationError, NotFoundError, ValidationError, ServerError,
};
