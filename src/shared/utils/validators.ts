import { StringUtils } from './string.utils';

export function isValidEmail(email: string): boolean {
  return StringUtils.isValidEmail(email);
}

export function isValidCpf(cpf: string): boolean {
  return StringUtils.isValidCpf(cpf);
}

export function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
}

export function isStrongPassword(password: string): boolean {
  return password.length >= 6;
}
