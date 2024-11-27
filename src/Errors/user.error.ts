class NotFoundError extends Error {
  constructor(message:string) {
    super(message);
    this.name = "NotFoundError";
  }
}

class UnauthorizedError extends Error {
  constructor(message:string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

class BadRequestError extends Error {
  constructor(message:string) {
    super(message);
    this.name = "BadRequestError";
  }
}

class InvalidPrivilegesError extends Error {
  constructor(message :string) {
    super(message);
    this.name = "InvalidPrivilegesError"
  } 
}

class InternalServerError extends Error {
  constructor(message :string) {
    super(message);
    this.name = "InternalServerError"
  } 
}


class InvalidRequestError extends Error {
  constructor(message :string) {
    super(message);
    this.name = "InvalidRequestError"
  } 
}