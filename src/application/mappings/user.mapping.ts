import { User } from "../../domain/entities/User";

export interface UserPublicDTO {
  id: string;
  email: string;
  phone: string;
  fullName: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  active: boolean;
  role: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  createdAt: Date;
}

export class UserMapper {
  static toPublicDTO(user: User): UserPublicDTO {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      fullName: user.profile?.fullName ?? null,
      nickname: user.profile?.nickname ?? null,
      avatarUrl: user.profile?.avatarUrl ?? null,
      emailVerified: user.emailVerified,
      active: user.active,
      role: user.roles[0]?.role ?? "user",
      level: user.level?.level ?? 1,
      currentXp: user.level?.currentXp ?? 0,
      nextLevelXp: user.level?.nextLevelXp ?? 100,
      createdAt: user.createdAt,
    };
  }
}
