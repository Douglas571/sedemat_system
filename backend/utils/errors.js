class UserNotAuthorizedError extends Error {
  constructor(message) {
    super(message ?? 'User not authorized');
    this.name = 'UserNotAuthorized';
    this.statusCode = 401;
  }
}

module.exports = {
  UserNotAuthorizedError
}