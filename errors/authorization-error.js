class AuthorizationError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode || 401;
  }
}

module.exports = AuthorizationError;
