export function ValidationError(message) {
  this.name = 'ValidationError';
  this.message = message || 'validation error';
  this.stack = (new Error(this.message)).stack;
}
ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;

export function RepositoryError(message) {
  this.name = 'RepositoryError';
  this.message = message || 'repository error';
  this.stack = (new Error(this.message)).stack;
}
RepositoryError.prototype = Object.create(Error.prototype);
RepositoryError.prototype.constructor = RepositoryError;

export function StorageError(message) {
  this.name = 'StorageError';
  this.message = message || 'storage error';
  this.stack = (new Error(this.message)).stack;
}
StorageError.prototype = Object.create(Error.prototype);
StorageError.prototype.constructor = StorageError;

export function SessionInUseError(message) {
  this.name = 'SessionInUseError';
  this.message = message || 'session in use';
  this.stack = (new Error(this.message)).stack;
}
SessionInUseError.prototype = Object.create(Error.prototype);
SessionInUseError.prototype.constructor = SessionInUseError;

export function FrontMachineIdInUseError(message) {
  this.name = 'FrontMachineIdInUseError';
  this.message = message || 'front machine id in use';
  this.stack = (new Error(this.message)).stack;
}
FrontMachineIdInUseError.prototype = Object.create(Error.prototype);
FrontMachineIdInUseError.prototype.constructor = FrontMachineIdInUseError;
