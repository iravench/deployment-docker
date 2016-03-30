export function ValidationError(message) {
  this.name = 'ValidationError';
  this.message = message || 'validation failed';
  this.stack = (new Error()).stack;
}
ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;

export function RepositoryError(message) {
  this.name = 'RepositoryError';
  this.message = message || 'repository failed';
  this.stack = (new Error()).stack;
}
RepositoryError.prototype = Object.create(Error.prototype);
RepositoryError.prototype.constructor = RepositoryError;

export function StorageError(message) {
  this.name = 'StorageError';
  this.message = message || 'storage failed';
  this.stack = (new Error()).stack;
}
StorageError.prototype = Object.create(Error.prototype);
StorageError.prototype.constructor = StorageError;
