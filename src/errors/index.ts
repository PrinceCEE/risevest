export class BaseError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
  }
}

export class NotFoundError extends BaseError {
  constructor(message = "Not found") {
    super(message);

    this.statusCode = 404;
  }
}

export class BadRequestError extends BaseError {
  constructor(message = "Bad request") {
    super(message);

    this.statusCode = 400;
  }
}

export class InternalServerError extends BaseError {
  constructor(message = "Internal server error") {
    super(message);

    this.statusCode = 500;
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message = "Unauthorized") {
    super(message);

    this.statusCode = 401;
  }
}

export class NotImplementedError extends BaseError {
  constructor(message = "Method not implemented") {
    super(message);

    this.statusCode = 501;
  }
}
