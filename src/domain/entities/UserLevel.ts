// src/domain/entities/UserLevel.ts
import { BaseEntity } from "./base.entity";

export class UserLevel extends BaseEntity {
  userId: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  totalXpEarned: number;

  constructor(userId: string) {
    super();
    this.id = crypto.randomUUID();
    this.userId = userId;
    this.level = 1;
    this.currentXp = 0;
    this.nextLevelXp = 100;
    this.totalXpEarned = 0;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  private calculateNextLevelXP(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  addXp(amount: number): {
    leveledUp: boolean;
    newLevel: number;
    levelsGained: number;
  } {
    this.currentXp += amount;
    this.totalXpEarned += amount;
    let levelsGained = 0;

    while (this.currentXp >= this.nextLevelXp) {
      this.currentXp -= this.nextLevelXp;
      this.level++;
      this.nextLevelXp = this.calculateNextLevelXP(this.level);
      levelsGained++;
    }

    this.updatedAt = new Date();
    return { leveledUp: levelsGained > 0, newLevel: this.level, levelsGained };
  }

  getProgressToNextLevel(): number {
    return (this.currentXp / this.nextLevelXp) * 100;
  }

  getLevelTitle(): string {
    if (this.level >= 100) return "Mestre Supremo";
    if (this.level >= 80) return "Lenda Viva";
    if (this.level >= 60) return "Mestre Experiente";
    if (this.level >= 40) return "Guerreiro Dedicado";
    if (this.level >= 20) return "Aprendiz Avançado";
    if (this.level >= 10) return "Aprendiz";
    if (this.level >= 5) return "Iniciante";
    return "Novo Explorador";
  }

  static fromDatabase(data: any): UserLevel {
    const entity = new UserLevel(data.user_id);
    entity.id = data.id;
    entity.level = data.level;
    entity.currentXp = data.current_xp;
    entity.nextLevelXp = data.next_level_xp;
    entity.totalXpEarned = data.total_xp_earned;
    entity.createdAt = data.created_at;
    entity.updatedAt = data.updated_at;
    return entity;
  }

  toDatabase(): any {
    return {
      id: this.id,
      user_id: this.userId,
      level: this.level,
      current_xp: this.currentXp,
      next_level_xp: this.nextLevelXp,
      total_xp_earned: this.totalXpEarned,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}
