import { DomainException } from "./DomainException.js";

export class BusinessRuleException extends DomainException {
  constructor(message: string) {
    super(message, "BUSINESS_RULE_VIOLATION");
    this.name = "BusinessRuleException";
  }
}
