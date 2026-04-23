import { pool } from "../db/connection";

export class ConquistaRepository {
  async findAll(): Promise<any[]> {
    const result = await pool.query(
      "SELECT * FROM conquistas ORDER BY xp_recompensa",
    );
    return result.rows;
  }

  async findUnlockedByUser(userId: string): Promise<any[]> {
    const result = await pool.query(
      `SELECT c.*, uc.desbloqueado_em FROM conquistas c
       JOIN user_conquistas uc ON uc.conquista_id = c.id
       WHERE uc.user_id = $1 ORDER BY uc.desbloqueado_em DESC`,
      [userId],
    );
    return result.rows;
  }

  async unlock(userId: string, conquistaId: string): Promise<void> {
    const existing = await pool.query(
      "SELECT id FROM user_conquistas WHERE user_id = $1 AND conquista_id = $2",
      [userId, conquistaId],
    );
    if (existing.rows.length === 0) {
      await pool.query(
        "INSERT INTO user_conquistas (user_id, conquista_id, desbloqueado_em) VALUES ($1, $2, $3)",
        [userId, conquistaId, new Date()],
      );
    }
  }
}
