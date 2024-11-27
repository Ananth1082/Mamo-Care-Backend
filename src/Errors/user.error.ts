export class NotFoundError extends Error {
  constructor(message:string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message:string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class BadRequestError extends Error {
  constructor(message:string) {
    super(message);
    this.name = "BadRequestError";
  }
}

export class InvalidPrivilegesError extends Error {
  constructor(message :string) {
    super(message);
    this.name = "InvalidPrivilegesError"
  } 
}

export class InternalServerError extends Error {
  constructor(message :string) {
    super(message);
    this.name = "InternalServerError"
  } 
}


export class InvalidRequestError extends Error {
  constructor(message :string) {
    super(message);
    this.name = "InvalidRequestError"
  } 
}