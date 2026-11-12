export class NotFoundException extends Error {
  constructor(message: string) {
    super(message, { cause: 404 });
  }
}

export class UnAuthorizedException extends Error {
  constructor(message: string) {
    super(message, { cause: 401 });
  }
}

export class ConflictException extends Error {
  constructor(message: string) {
    super(message, { cause: 409 });
  }
}

// { message:"validation error" , details:[{path:"userName", message:"must be less than 20 char"},{},{}] }
export class BadRequestException extends Error {
  //   public details: IDetails[];
  constructor(
    message: string,
    public details?: Record<string, string>[],
  ) {
    super(message, { cause: 400 });
    // this.details = details;
  }
}
