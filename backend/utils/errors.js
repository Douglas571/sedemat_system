class UserNotAuthorizedError extends Error {
  constructor(message) {
    super(message ?? 'User not authorized');
    this.name = 'UserNotAuthorized';
    this.statusCode = 401;
  }
}

class FileNotFoundError extends Error {
  constructor(message) {
    super(message ?? 'File not found');
    this.name = 'FileNotFound';
    this.statusCode = 404;
  }
}

class InvalidFileError extends Error {
  constructor(message) {
    super(message ?? 'File is not valid');
    this.name = 'InvalidFile';
    this.statusCode = 400;
  }

}

class UnsupportedFileTypeError extends Error {
  constructor(message) {
    super(message ?? 'File type is not supported');
    this.name = 'UnsupportedFileType';
    this.statusCode = 415;
  }
}

class GrossIncomeNotFoundError extends Error {
  constructor(message) {
    super(message ?? 'Gross income not found');
    this.name = 'GrossIncomeNotFound';
    this.statusCode = 404;
  }
}

class AssociationConflictError extends Error {
  constructor(message) {
    super(message ?? 'Association conflict');
    this.name = 'AssociationConflict';
    this.statusCode = 409;
  }
}

class SettlementInvalidDateError extends Error {
  constructor(message) {
    super(message ?? 'Settlement date is before than the last one');
    this.name = 'SettlementInvalidDateError';
    this.statusCode = 400;
  }
}

class InvalidFormatError extends Error {
  constructor(message) {
    super(message ?? 'Invalid file format');
    this.name = 'InvalidFormat';
    this.statusCode = 400;
  }
}


module.exports = {
  UserNotAuthorizedError,
  FileNotFoundError,
  InvalidFileError,
  UnsupportedFileTypeError,
  GrossIncomeNotFoundError,
  AssociationConflictError,
  SettlementInvalidDateError
};
