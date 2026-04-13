export class ConflictException extends Error {
  public readonly statusCode: number = 409;
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "ConflictException";
    this.field = field;
    Object.setPrototypeOf(this, ConflictException.prototype);
  }

  static duplicateEmail(email: string): ConflictException {
    return new ConflictException(`Email ${email} already exists`, "email");
  }

  static duplicateCpf(cpf: string): ConflictException {
    return new ConflictException(`CPF ${cpf} already exists`, "cpf");
  }

  static duplicateName(name: string, entity: string): ConflictException {
    return new ConflictException(
      `${entity} with name "${name}" already exists`,
      "name",
    );
  }
}
