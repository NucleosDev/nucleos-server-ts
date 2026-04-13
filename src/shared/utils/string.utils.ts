// src/shared/utils/string.utils.ts
export class StringUtils {
  static ensureString(value: unknown, defaultValue: string = ""): string {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    return String(value);
  }

  static cleanPhone(phone: string | undefined | null): string {
    if (!phone) return "";
    return phone.replace(/\D/g, "");
  }

  static cleanCpf(cpf: string | undefined | null): string {
    if (!cpf) return "";
    return cpf.replace(/\D/g, "");
  }

  static normalizeEmail(email: string | undefined | null): string {
    if (!email) return "";
    return email.trim().toLowerCase();
  }

  static formatPhone(phone: string): string {
    const cleaned = this.cleanPhone(phone);
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return phone;
  }

  static formatCpf(cpf: string): string {
    const cleaned = this.cleanCpf(cpf);
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return cpf;
  }

  static truncate(str: string | undefined | null, maxLength: number): string {
    if (!str) return "";
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + "...";
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    return emailRegex.test(email);
  }

  static isValidCpf(cpf: string): boolean {
    const cleaned = this.cleanCpf(cpf);
    if (cleaned.length !== 11) return false;

    // Eliminar CPFs conhecidos inválidos
    if (/^(\d)\1{10}$/.test(cleaned)) return false;

    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    let digit = remainder === 10 || remainder === 11 ? 0 : remainder;
    if (digit !== parseInt(cleaned.charAt(9))) return false;

    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    digit = remainder === 10 || remainder === 11 ? 0 : remainder;
    if (digit !== parseInt(cleaned.charAt(10))) return false;

    return true;
  }

  static isValidPhone(phone: string): boolean {
    const cleaned = this.cleanPhone(phone);
    return cleaned.length === 10 || cleaned.length === 11;
  }

  static capitalize(str: string): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  static slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
