import { pool } from "../db/connection";
import { Streak } from "../../../domain/entities/Streak";

export class StreakRepository {
  async findByUserId(userId: string): Promise<Streak | null> {
    const result = await pool.query(
      "SELECT * FROM streaks WHERE user_id = $1 AND nucleo_id IS NULL ORDER BY created_at DESC LIMIT 1",
      [userId],
    );
    if (result.rows.length === 0) return null;
    return Streak.fromDatabase(result.rows[0]);
  }

  async save(entity: Streak): Promise<void> {
    const data = entity.toDatabase();
    await pool.query(
      `INSERT INTO streaks (id, user_id, nucleo_id, streak_type, current_streak, max_streak, last_activity_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         current_streak = EXCLUDED.current_streak,
         max_streak = EXCLUDED.max_streak,
         last_activity_date = EXCLUDED.last_activity_date,
         updated_at = EXCLUDED.updated_at`,
      [
        data.id,
        data.user_id,
        data.nucleo_id,
        data.streak_type,
        data.current_streak,
        data.max_streak,
        data.last_activity_date,
        data.created_at,
        data.updated_at,
      ],
    );
  }

  async updateStreak(userId: string): Promise<Streak> {
    let entity = await this.findByUserId(userId);
    if (!entity) entity = new Streak(userId);

    entity.update();
    await this.save(entity);
    return entity;
  }
}
