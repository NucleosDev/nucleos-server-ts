import { DomainException } from "./DomainException.js";

export class UnauthorizedException extends DomainException {
  constructor(message = "Access denied") {
    super(message, "UNAUTHORIZED");
    this.name = "UnauthorizedException";
  }
}
