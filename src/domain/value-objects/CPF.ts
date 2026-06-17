export class CPF {
  private readonly raw: string;

  constructor(cpf: string) {
    const cleaned = cpf.replace(/\D/g, "");
    if (!CPF.isValid(cleaned)) {
      throw new Error(`Invalid CPF: "${cpf}"`);
    }
    this.raw = cleaned;
  }

  static isValid(cpf: string): boolean {
    const cleaned = cpf.replace(/\D/g, "");
    if (cleaned.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleaned)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned[i]!) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned[9]!)) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned[i]!) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cleaned[10]!);
  }

  toRaw(): string {
    return this.raw;
  }

  toFormatted(): string {
    return this.raw.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  toString(): string {
    return this.raw;
  }

  equals(other: CPF): boolean {
    return this.raw === other.raw;
  }
}
