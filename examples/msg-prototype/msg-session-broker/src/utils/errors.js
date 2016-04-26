export function ValidationError(message) {
  this.name = 'ValidationError';
  this.message = message || 'validation failed';
  this.stack = (new Error(this.message)).stack;
}
ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;

export function RepositoryError(message) {
  this.name = 'RepositoryError';
  this.message = message || 'repository failed';
  this.stack = (new Error(this.message)).stack;
}
RepositoryError.prototype = Object.create(Error.prototype);
RepositoryError.prototype.constructor = RepositoryError;

export function StorageError(message) {
  this.name = 'StorageError';
  this.message = message || 'storage failed';
  this.stack = (new Error(this.message)).stack;
}
StorageError.prototype = Object.create(Error.prototype);
StorageError.prototype.constructor = StorageError;

export function NoAvailableFrontMachineError(message) {
  this.name = 'NoAvailableFrontMachineError';
  this.message = message || 'no available front machine can be found';
  this.stack = (new Error(this.message)).stack;
}
NoAvailableFrontMachineError.prototype = Object.create(Error.prototype);
NoAvailableFrontMachineError.prototype.constructor = NoAvailableFrontMachineError;

export function ActiveSessionFoundError(message) {
  this.name = 'ActiveSessionFoundError';
  this.message = message || 'active session found';
  this.stack = (new Error(this.message)).stack;
}
ActiveSessionFoundError.prototype = Object.create(Error.prototype);
ActiveSessionFoundError.prototype.constructor = ActiveSessionFoundError;
