export class BusinessRuleException extends Error {
  public readonly statusCode: number = 422;
  public readonly ruleName: string;

  constructor(message: string, ruleName: string = "BUSINESS_RULE_VIOLATION") {
    super(message);
    this.name = "BusinessRuleException";
    this.ruleName = ruleName;
    Object.setPrototypeOf(this, BusinessRuleException.prototype);
  }

  static maxNucleosReached(max: number): BusinessRuleException {
    return new BusinessRuleException(
      `Maximum number of nucleos (${max}) reached`,
      "MAX_NUCLEOS_REACHED",
    );
  }

  static cannotShareWithSelf(): BusinessRuleException {
    return new BusinessRuleException(
      "You cannot share a nucleo with yourself",
      "CANNOT_SHARE_WITH_SELF",
    );
  }

  static duplicateRelation(): BusinessRuleException {
    return new BusinessRuleException(
      "This relation already exists between these nucleos",
      "DUPLICATE_RELATION",
    );
  }
}
