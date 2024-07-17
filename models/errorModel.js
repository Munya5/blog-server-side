// errorModel.js
class HttpError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.name = 'HttpError';
    }
}
  
module.exports = HttpError;

  