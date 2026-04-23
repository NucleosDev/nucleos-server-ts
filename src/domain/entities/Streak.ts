import { BaseEntity } from "./base.entity";

export class Streak extends BaseEntity {
  userId: string;
  nucleoId: string | null;
  streakType: string;
  currentStreak: number;
  maxStreak: number;
  lastActivityDate: Date;

  constructor(
    userId: string,
    streakType: string = "daily",
    nucleoId: string | null = null,
  ) {
    super();
    this.id = crypto.randomUUID();
    this.userId = userId;
    this.streakType = streakType;
    this.nucleoId = nucleoId;
    this.currentStreak = 0;
    this.maxStreak = 0;
    this.lastActivityDate = new Date();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  update(today: Date = new Date()): {
    increased: boolean;
    milestone: number | null;
  } {
    const lastDate = new Date(this.lastActivityDate);
    lastDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.floor(
      (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    let increased = false;
    let milestone: number | null = null;

    if (diffDays === 1) {
      this.currentStreak++;
      increased = true;
      const milestones = [3, 7, 14, 30, 60, 100, 365];
      if (milestones.includes(this.currentStreak))
        milestone = this.currentStreak;
      if (this.currentStreak > this.maxStreak)
        this.maxStreak = this.currentStreak;
    } else if (diffDays > 1) {
      this.currentStreak = 1;
      increased = true;
    }

    this.lastActivityDate = today;
    this.updatedAt = new Date();
    return { increased, milestone };
  }

  static fromDatabase(data: any): Streak {
    const entity = new Streak(data.user_id, data.streak_type, data.nucleo_id);
    entity.id = data.id;
    entity.currentStreak = data.current_streak;
    entity.maxStreak = data.max_streak;
    entity.lastActivityDate = data.last_activity_date;
    entity.createdAt = data.created_at;
    entity.updatedAt = data.updated_at;
    return entity;
  }

  toDatabase(): any {
    return {
      id: this.id,
      user_id: this.userId,
      nucleo_id: this.nucleoId,
      streak_type: this.streakType,
      current_streak: this.currentStreak,
      max_streak: this.maxStreak,
      last_activity_date: this.lastActivityDate,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}
