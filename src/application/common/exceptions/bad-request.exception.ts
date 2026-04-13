export class BadRequestException extends Error {
  public readonly statusCode: number = 400;
  public readonly errors?: string[];

  constructor(message: string, errors?: string[]) {
    super(message);
    this.name = "BadRequestException";
    this.errors = errors;
    Object.setPrototypeOf(this, BadRequestException.prototype);
  }

  static invalidData(errors: string[]): BadRequestException {
    return new BadRequestException("Invalid data provided", errors);
  }
}
