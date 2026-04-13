export class ValidationException extends Error {
  public readonly statusCode: number = 422;
  public readonly errors: string[];

  constructor(errors: string[] | string) {
    const errorArray = Array.isArray(errors) ? errors : [errors];
    super(`Validation failed: ${errorArray.join(', ')}`);
    this.name = 'ValidationException';
    this.errors = errorArray;
    Object.setPrototypeOf(this, ValidationException.prototype);
  }

  static fromZodError(zodError: any): ValidationException {
    const errors = zodError.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`);
    return new ValidationException(errors);
  }

  addError(error: string): void {
    this.errors.push(error);
    this.message = `Validation failed: ${this.errors.join(', ')}`;
  }
}