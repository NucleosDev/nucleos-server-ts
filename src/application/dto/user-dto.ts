export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  nickname: string | null;
  avatarUrl: string | null;
  cpf: string | null;
  phone: string | null;
  emailVerified: boolean;
  active: boolean;
  role: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  totalXpEarned: number;
  plan: string;
  createdAt: Date;
}