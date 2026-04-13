// src/domain/entities/User.ts
import { UserConquista } from "./UserConquista";
import { UserLevel } from "./UserLevel";
import { UserPreference } from "./UserPreference";
import { UserProfile } from "./UserProfile";
import { UserRole } from "./UserRole";
import { UserSecurity } from "./UserSecurity";
import { StringUtils } from "../../shared/utils/string.utils";

export class User {
  id: string;

  email: string;
  phone: string;
  cpf: string;
  passwordHash: string;

  emailVerified: boolean;
  active: boolean;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  // relations
  profile: UserProfile | null;
  security: UserSecurity | null;
  preference: UserPreference | null;

  roles: UserRole[];
  conquistas: UserConquista[];
  level: UserLevel | null;

  constructor(params: {
    email: string;
    phone: string;
    cpf: string;
    passwordHash: string;
    fullName: string;
    nickname?: string;
  }) {
    this.id = crypto.randomUUID();

    // Usando utilitários para garantir strings
    this.email = StringUtils.normalizeEmail(params.email);
    this.phone = StringUtils.cleanPhone(params.phone);
    this.cpf = StringUtils.cleanCpf(params.cpf);
    this.passwordHash = params.passwordHash;

    this.emailVerified = false;
    this.active = true;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.deletedAt = null;

    // Inicializar arrays
    this.roles = [];
    this.conquistas = [];

    // Criar nickname (com fallback seguro)
    const nickname =
      params.nickname || params.fullName.split(" ")[0] || "Usuário";

    // Criar profile automaticamente
    this.profile = new UserProfile({
      userId: this.id,
      fullName: params.fullName,
      nickname: nickname,
      avatarUrl: `https://ui-avatars.com/api/?background=random&color=fff&name=${encodeURIComponent(params.fullName)}`,
    });

    // Criar security
    this.security = new UserSecurity({ userId: this.id });

    // Criar preference
    this.preference = new UserPreference({ userId: this.id });

    // Criar level
    this.level = new UserLevel({ userId: this.id });

    // Adicionar role padrão
    this.roles.push(new UserRole({ userId: this.id, role: "user" }));
  }

  verifyEmail(): void {
    this.emailVerified = true;
    this.updatedAt = new Date();
  }

  changePassword(newHash: string): void {
    this.passwordHash = newHash;
    if (this.security) {
      this.security.passwordUpdatedAt = new Date();
    }
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.active = false;
    this.updatedAt = new Date();
  }

  softDelete(): void {
    this.deletedAt = new Date();
    this.active = false;
    this.updatedAt = new Date();
  }

  updateProfile(email: string, phone: string): void {
    this.email = StringUtils.normalizeEmail(email);
    this.phone = StringUtils.cleanPhone(phone);
    this.updatedAt = new Date();
  }

  updatePersonalInfo(fullName: string, nickname?: string): void {
    if (this.profile) {
      this.profile.fullName = fullName;
      if (nickname) {
        this.profile.nickname = nickname;
      }
    }
    this.updatedAt = new Date();
  }

  updateAvatar(avatarUrl: string): void {
    if (this.profile) {
      this.profile.avatarUrl = avatarUrl;
    }
    this.updatedAt = new Date();
  }

  addXp(amount: number): { leveledUp: boolean; newLevel: number } {
    if (!this.level) {
      this.level = new UserLevel({ userId: this.id });
    }
    return this.level.addXp(amount);
  }

  incrementFailedAttempts(): void {
    if (this.security) {
      this.security.failedAttempts++;
    }
  }

  resetFailedAttempts(): void {
    if (this.security) {
      this.security.failedAttempts = 0;
    }
  }

  updateLastLogin(): void {
    if (this.security) {
      this.security.lastLogin = new Date();
    }
  }

  hasRole(role: string): boolean {
    return this.roles.some((r) => r.role === role);
  }

  isAdmin(): boolean {
    return this.hasRole("admin");
  }

  isActive(): boolean {
    return this.active && this.deletedAt === null;
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      phone: this.phone,
      cpf: this.cpf,
      emailVerified: this.emailVerified,
      active: this.active,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      profile: this.profile,
      level: this.level,
      roles: this.roles.map((r) => r.role),
    };
  }
}
