import { Streak } from "../entities/Streak";

export interface IStreakRepository {
  findByUserId(userId: string): Promise<Streak[]>;
  findByUserAndType(
    userId: string,
    streakType: string,
    nucleoId?: string,
  ): Promise<Streak | null>;
  create(streak: Streak): Promise<Streak>;
  save(streak: Streak): Promise<Streak>;
}
