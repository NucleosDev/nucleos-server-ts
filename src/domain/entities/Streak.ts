// src/domain/entities/Streak.ts
import { randomUUID } from "crypto";

export class Streak {
  id: string;
  userId: string;
  nucleoId: string | null;
  streakType: string;
  currentStreak: number;
  maxStreak: number;
  lastActivityDate: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: {
    userId: string;
    streakType: string;
    nucleoId?: string;
  }) {
    this.id = randomUUID();
    this.userId = params.userId;
    this.nucleoId = params.nucleoId ?? null;
    this.streakType = params.streakType;
    this.currentStreak = 0;
    this.maxStreak = 0;
    this.lastActivityDate = null;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // 🔥 Método para reconstruir a partir do banco de dados
  static fromDatabase(row: any): Streak {
    const streak = new Streak({
      userId: row.user_id,
      streakType: row.streak_type,
      nucleoId: row.nucleo_id,
    });
    streak.id = row.id;
    streak.currentStreak = row.current_streak;
    streak.maxStreak = row.max_streak;
    streak.lastActivityDate = row.last_activity_date;
    streak.createdAt = new Date(row.created_at);
    streak.updatedAt = new Date(row.updated_at);
    return streak;
  }

  registrarAtividade(data: Date): void {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataAtividade = new Date(data);
    dataAtividade.setHours(0, 0, 0, 0);

    if (this.lastActivityDate) {
      const ultima = new Date(this.lastActivityDate);
      ultima.setHours(0, 0, 0, 0);
      const diffDias = Math.floor(
        (dataAtividade.getTime() - ultima.getTime()) / 86_400_000,
      );

      if (diffDias === 1) {
        this.currentStreak++;
      } else if (diffDias > 1) {
        this.currentStreak = 1;
      }
    } else {
      this.currentStreak = 1;
    }

    if (this.currentStreak > this.maxStreak) {
      this.maxStreak = this.currentStreak;
    }

    this.lastActivityDate = dataAtividade;
    this.updatedAt = new Date();
  }
}
