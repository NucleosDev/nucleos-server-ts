import { DomainException } from "./DomainException.js";

export class NotFoundException extends DomainException {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with id "${id}" not found` : `${resource} not found`,
      "NOT_FOUND",
    );
    this.name = "NotFoundException";
  }
}
