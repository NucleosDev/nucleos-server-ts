export interface UserLevelDTO {
  userId: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  totalXpEarned: number;
}

export interface StreakDTO {
  id: string;
  streakType: string;
  currentStreak: number;
  maxStreak: number;
  lastActivityDate: Date | null;
}
