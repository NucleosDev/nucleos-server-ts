import { pool } from "../db/connection";

export class XpLogRepository {
  async getTodayXp(userId: string): Promise<number> {
    const today = new Date().toISOString().split("T")[0];
    const result = await pool.query(
      "SELECT COALESCE(SUM(xp_amount), 0) as total FROM xp_logs WHERE user_id = $1 AND DATE(created_at) = $2",
      [userId, today],
    );
    return parseInt(result.rows[0]?.total || 0);
  }

  async getUserStats(
    userId: string,
  ): Promise<{ totalXp: number; totalActions: number }> {
    const result = await pool.query(
      "SELECT COALESCE(SUM(xp_amount), 0) as total_xp, COUNT(*) as total_actions FROM xp_logs WHERE user_id = $1",
      [userId],
    );
    return {
      totalXp: parseInt(result.rows[0]?.total_xp || 0),
      totalActions: parseInt(result.rows[0]?.total_actions || 0),
    };
  }

  async query(sql: string, params: any[]): Promise<any> {
    return await pool.query(sql, params);
  }
}
