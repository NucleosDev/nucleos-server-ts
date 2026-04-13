import { Request, Response } from "express";
import { logger } from "../../../shared/utils/logger";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class GamificacaoController {
  static async getLevel(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const row = await pool.query(
        `SELECT * FROM user_levels WHERE user_id=$1`,
        [userId],
      );
      if (!row.rows.length) {
        res
          .status(404)
          .json({ success: false, message: "Level não encontrado" });
        return;
      }
      const r = row.rows[0];
      res.json({
        userId: r.user_id,
        level: r.level,
        currentXp: r.current_xp,
        nextLevelXp: r.next_level_xp,
        totalXpEarned: r.total_xp_earned,
      });
    } catch (e) {
      logger.error("Erro ao buscar level:", e);
      res.status(500).json({ success: false, message: "Erro interno" });
    }
  }

  static async getStreaks(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const rows = await pool.query(
        `SELECT * FROM streaks WHERE user_id=$1 ORDER BY current_streak DESC`,
        [userId],
      );
      res.json(
        rows.rows.map((r) => ({
          id: r.id,
          streakType: r.streak_type,
          nucleoId: r.nucleo_id,
          currentStreak: r.current_streak,
          maxStreak: r.max_streak,
          lastActivityDate: r.last_activity_date,
        })),
      );
    } catch (e) {
      logger.error("Erro ao buscar streaks:", e);
      res.status(500).json({ success: false, message: "Erro interno" });
    }
  }

  static async getConquistas(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const rows = await pool.query(
        `SELECT c.*, uc.desbloqueado_em FROM conquistas c
         INNER JOIN user_conquistas uc ON uc.conquista_id = c.id
         WHERE uc.user_id=$1 ORDER BY uc.desbloqueado_em DESC`,
        [userId],
      );
      res.json(
        rows.rows.map((r) => ({
          id: r.id,
          nome: r.nome,
          descricao: r.descricao,
          iconeUrl: r.icone_url,
          tipo: r.tipo,
          xpRecompensa: r.xp_recompensa,
          desbloqueadoEm: r.desbloqueado_em,
        })),
      );
    } catch (e) {
      logger.error("Erro ao buscar conquistas:", e);
      res.status(500).json({ success: false, message: "Erro interno" });
    }
  }
}
