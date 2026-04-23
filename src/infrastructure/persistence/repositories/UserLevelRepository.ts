import { pool } from "../db/connection";
import { UserLevel } from "../../../domain/entities/UserLevel";

export class UserLevelRepository {
  async findByUserId(userId: string): Promise<UserLevel | null> {
    const result = await pool.query(
      "SELECT * FROM user_levels WHERE user_id = $1",
      [userId],
    );
    if (result.rows.length === 0) return null;
    return UserLevel.fromDatabase(result.rows[0]);
  }

  async save(entity: UserLevel): Promise<void> {
    const data = entity.toDatabase();
    await pool.query(
      `INSERT INTO user_levels (id, user_id, level, current_xp, next_level_xp, total_xp_earned, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id) DO UPDATE SET
         level = EXCLUDED.level,
         current_xp = EXCLUDED.current_xp,
         next_level_xp = EXCLUDED.next_level_xp,
         total_xp_earned = EXCLUDED.total_xp_earned,
         updated_at = EXCLUDED.updated_at`,
      [
        data.id,
        data.user_id,
        data.level,
        data.current_xp,
        data.next_level_xp,
        data.total_xp_earned,
        data.created_at,
        data.updated_at,
      ],
    );
  }

  async addXp(
    userId: string,
    amount: number,
    source: string,
    nucleoId?: string,
  ): Promise<{ leveledUp: boolean; newLevel: number }> {
    let entity = await this.findByUserId(userId);
    if (!entity) entity = new UserLevel(userId);

    const result = entity.addXp(amount);
    await this.save(entity);

    await pool.query(
      "INSERT INTO xp_logs (user_id, nucleo_id, xp_amount, source) VALUES ($1, $2, $3, $4)",
      [userId, nucleoId, amount, source],
    );

    return { leveledUp: result.leveledUp, newLevel: result.newLevel };
  }

  async getLeaderboard(limit: number = 10): Promise<any[]> {
    const result = await pool.query(
      `SELECT ul.user_id, up.full_name, ul.level, ul.total_xp_earned as total_xp
       FROM user_levels ul
       JOIN user_profiles up ON up.user_id = ul.user_id
       ORDER BY ul.total_xp_earned DESC LIMIT $1`,
      [limit],
    );
    return result.rows;
  }
}
