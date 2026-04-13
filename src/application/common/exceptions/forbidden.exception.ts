export class ForbiddenException extends Error {
  public readonly statusCode: number = 403;
  public readonly reason?: string;

  constructor(message: string = "Forbidden", reason?: string) {
    super(message);
    this.name = "ForbiddenException";
    this.reason = reason;
    Object.setPrototypeOf(this, ForbiddenException.prototype);
  }

  static missingPermission(permission: string): ForbiddenException {
    return new ForbiddenException(
      `Missing required permission: ${permission}`,
      "PERMISSION_DENIED",
    );
  }

  static notOwner(resource: string): ForbiddenException {
    return new ForbiddenException(
      `You are not the owner of this ${resource}`,
      "NOT_OWNER",
    );
  }
}
