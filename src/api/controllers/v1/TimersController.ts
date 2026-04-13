import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { logger } from "../../../shared/utils/logger";
import { randomUUID } from "crypto";

export class TimersController {
  static async listByNucleo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { nucleoId } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: "Não autenticado" });
        return;
      }

      const result = await pool.query(
        `SELECT t.id, t.nucleo_id, t.titulo, t.inicio, t.fim, t.duracao_segundos, t.created_at, t.updated_at
         FROM timers t
         JOIN nucleos n ON n.id = t.nucleo_id
         WHERE t.nucleo_id = $1 AND n.user_id = $2
         ORDER BY t.created_at DESC`,
        [nucleoId, userId],
      );

      res.json(result.rows);
    } catch (error) {
      logger.error("Erro ao listar timers:", error);
      res.status(500).json({ success: false, message: "Erro interno" });
    }
  }

  static async start(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { nucleoId, titulo } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: "Não autenticado" });
        return;
      }

      const check = await pool.query(
        `SELECT user_id FROM nucleos WHERE id = $1 AND deleted_at IS NULL`,
        [nucleoId],
      );

      if (check.rows.length === 0 || check.rows[0].user_id !== userId) {
        res.status(403).json({ success: false, message: "Sem permissão" });
        return;
      }

      const id = randomUUID();
      await pool.query(
        `INSERT INTO timers (id, nucleo_id, titulo, inicio, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW(), NOW())`,
        [id, nucleoId, titulo || "Sessão de foco"],
      );

      const result = await pool.query(`SELECT * FROM timers WHERE id = $1`, [
        id,
      ]);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      logger.error("Erro ao iniciar timer:", error);
      res.status(500).json({ success: false, message: "Erro interno" });
    }
  }

  static async stop(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      const check = await pool.query(
        `SELECT t.id, n.user_id, t.inicio
         FROM timers t
         JOIN nucleos n ON n.id = t.nucleo_id
         WHERE t.id = $1`,
        [id],
      );

      if (check.rows.length === 0 || check.rows[0].user_id !== userId) {
        res.status(403).json({ success: false, message: "Sem permissão" });
        return;
      }

      const inicio = new Date(check.rows[0].inicio);
      const fim = new Date();
      const duracaoSegundos = Math.floor(
        (fim.getTime() - inicio.getTime()) / 1000,
      );

      await pool.query(
        `UPDATE timers SET fim = NOW(), duracao_segundos = $1, updated_at = NOW() WHERE id = $2`,
        [duracaoSegundos, id],
      );

      // Adicionar XP baseado no tempo focado
      const xpAmount = Math.floor(duracaoSegundos / 60); // 1 XP por minuto
      if (xpAmount > 0) {
        await pool.query(
          `INSERT INTO xp_logs (user_id, nucleo_id, xp_amount, source, created_at)
           VALUES ($1, (SELECT nucleo_id FROM timers WHERE id = $2), $3, 'timer', NOW())`,
          [userId, id, xpAmount],
        );
      }

      res.json({ success: true, duracaoSegundos, xpGanho: xpAmount });
    } catch (error) {
      logger.error("Erro ao parar timer:", error);
      res.status(500).json({ success: false, message: "Erro interno" });
    }
  }
}
