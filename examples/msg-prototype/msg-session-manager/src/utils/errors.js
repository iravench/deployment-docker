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

export function SessionAlreadyActivatedError(message) {
  this.name = 'SessionAlreadyActivatedError';
  this.message = message || 'session has already been activated';
  this.stack = (new Error()).stack;
}
SessionAlreadyActivatedError.prototype = Object.create(Error.prototype);
SessionAlreadyActivatedError.prototype.constructor = SessionAlreadyActivatedError;

export function FrontMachineIdInUseError(message) {
  this.name = 'FrontMachineIdInUseError';
  this.message = message || 'front machine id is in use';
  this.stack = (new Error()).stack;
}
FrontMachineIdInUseError.prototype = Object.create(Error.prototype);
FrontMachineIdInUseError.prototype.constructor = FrontMachineIdInUseError;
