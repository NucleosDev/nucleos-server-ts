export class UnauthorizedException extends Error {
  public readonly statusCode: number = 401;

  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedException';
    Object.setPrototypeOf(this, UnauthorizedException.prototype);
  }

  static invalidToken(): UnauthorizedException {
    return new UnauthorizedException('Invalid or expired token');
  }

  static missingToken(): UnauthorizedException {
    return new UnauthorizedException('No token provided');
  }
}