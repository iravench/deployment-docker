export const ValidationError = function ValidationError(message) {
  this.name = 'ValidationError';
  this.message = message || 'validation failed';
  this.stack = (new Error()).stack;
}
ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;
