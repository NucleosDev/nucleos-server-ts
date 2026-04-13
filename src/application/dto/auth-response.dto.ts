// src/api/dtos/auth-response.dto.ts
export class AuthResponseDto {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  expiresAt?: string;
  userId?: string;
  email?: string;
  fullName?: string;
  cpf?: string;
  phone?: string;
  level?: number;
  currentXp?: number;
  nextLevelXp?: number;
  avatarUrl?: string;
  errors?: string[];

  constructor(params: Partial<AuthResponseDto> = {}) {
    this.success = params.success ?? false;
    this.message = params.message ?? "";
    this.token = params.token;
    this.refreshToken = params.refreshToken;
    this.expiresAt = params.expiresAt;
    this.userId = params.userId;
    this.email = params.email;
    this.fullName = params.fullName;
    this.cpf = params.cpf;
    this.phone = params.phone;
    this.level = params.level;
    this.currentXp = params.currentXp;
    this.nextLevelXp = params.nextLevelXp;
    this.avatarUrl = params.avatarUrl;
    this.errors = params.errors;
  }
}

// Helper function (opcional)
export function createAuthResponse(
  params: Partial<AuthResponseDto>,
): AuthResponseDto {
  return new AuthResponseDto(params);
}
