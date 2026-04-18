// src/api/controllers/v1/ProgressController.ts
import { Request, Response } from "express";
import { logger } from "../../../shared/utils/logger";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class ProgressController {
  static async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const [level, streaks, tarefas, habitos, nucleos] = await Promise.all([
        pool.query(`SELECT * FROM user_levels WHERE user_id=$1`, [userId]),
        pool.query(
          `SELECT * FROM streaks WHERE user_id=$1 ORDER BY current_streak DESC`,
          [userId],
        ),
        pool.query(
          `SELECT COUNT(*) AS total,
           COUNT(*) FILTER (WHERE status='concluida') AS concluidas,
           COUNT(*) FILTER (WHERE status='pendente') AS pendentes,
           COUNT(*) FILTER (WHERE status='atrasada') AS atrasadas
           FROM tarefas t JOIN blocos b ON b.id=t.bloco_id JOIN nucleos n ON n.id=b.nucleo_id
           WHERE n.user_id=$1 AND t.deleted_at IS NULL`,
          [userId],
        ),
        pool.query(
          `SELECT COUNT(*) AS total_habitos,
           COUNT(DISTINCT hr.habito_id) FILTER (WHERE hr.data >= CURRENT_DATE - 7) AS ativos_7d
           FROM habitos h JOIN blocos b ON b.id=h.bloco_id JOIN nucleos n ON n.id=b.nucleo_id
           LEFT JOIN habitos_registros hr ON hr.habito_id=h.id
           WHERE n.user_id=$1 AND h.deleted_at IS NULL`,
          [userId],
        ),
        pool.query(
          `SELECT COUNT(*) AS total FROM nucleos WHERE user_id=$1 AND deleted_at IS NULL`,
          [userId],
        ),
      ]);

      const l = level.rows[0];
      res.json({
        level: l
          ? {
              level: l.level,
              currentXp: l.current_xp,
              nextLevelXp: l.next_level_xp,
              totalXpEarned: l.total_xp_earned,
            }
          : null,
        streaks: streaks.rows.map((s) => ({
          type: s.streak_type,
          nucleoId: s.nucleo_id,
          current: s.current_streak,
          max: s.max_streak,
          lastActivity: s.last_activity_date,
        })),
        tarefas: {
          total: parseInt(tarefas.rows[0].total),
          concluidas: parseInt(tarefas.rows[0].concluidas),
          pendentes: parseInt(tarefas.rows[0].pendentes),
          atrasadas: parseInt(tarefas.rows[0].atrasadas),
          taxaConclusao:
            tarefas.rows[0].total > 0
              ? Math.round(
                  (parseInt(tarefas.rows[0].concluidas) /
                    parseInt(tarefas.rows[0].total)) *
                    100,
                )
              : 0,
        },
        habitos: {
          total: parseInt(habitos.rows[0].total_habitos),
          ativos7d: parseInt(habitos.rows[0].ativos_7d),
        },
        nucleos: { total: parseInt(nucleos.rows[0].total) },
      });
    } catch (e) {
      logger.error("Erro dashboard:", e);
      res.status(500).json({ success: false, message: "Erro interno" });
    }
  }

  static async getNucleoProgress(req: Request, res: Response): Promise<void> {
    try {
      const { nucleoId } = req.params;
      const [tarefas, habitos, timers, streaks] = await Promise.all([
        pool.query(
          `SELECT COUNT(*) AS total,
           COUNT(*) FILTER (WHERE status='concluida') AS concluidas
           FROM tarefas t JOIN blocos b ON b.id=t.bloco_id
           WHERE b.nucleo_id=$1 AND t.deleted_at IS NULL`,
          [nucleoId],
        ),
        pool.query(
          `SELECT COUNT(*) AS total,
           (SELECT COUNT(DISTINCT hr.habito_id)
            FROM habitos_registros hr
            JOIN habitos h ON h.id=hr.habito_id
            JOIN blocos b2 ON b2.id=h.bloco_id
            WHERE b2.nucleo_id=$1 AND hr.data=CURRENT_DATE) AS completados_hoje
           FROM habitos h JOIN blocos b ON b.id=h.bloco_id
           WHERE b.nucleo_id=$1 AND h.deleted_at IS NULL`,
          [nucleoId],
        ),
        pool.query(
          `SELECT SUM(duracao_segundos) AS total_segundos, COUNT(*) AS sessoes
           FROM timers WHERE nucleo_id=$1 AND duracao_segundos IS NOT NULL`,
          [nucleoId],
        ),
        pool.query(
          `SELECT current_streak, max_streak FROM streaks WHERE nucleo_id=$1`,
          [nucleoId],
        ),
      ]);
      res.json({
        tarefas: {
          total: parseInt(tarefas.rows[0].total),
          concluidas: parseInt(tarefas.rows[0].concluidas),
          taxaConclusao:
            tarefas.rows[0].total > 0
              ? Math.round(
                  (parseInt(tarefas.rows[0].concluidas) /
                    parseInt(tarefas.rows[0].total)) *
                    100,
                )
              : 0,
        },
        habitos: {
          total: parseInt(habitos.rows[0].total),
          completadosHoje: parseInt(habitos.rows[0].completados_hoje),
        },
        tempo: {
          totalSegundos: parseInt(timers.rows[0].total_segundos) || 0,
          sessoes: parseInt(timers.rows[0].sessoes) || 0,
          totalHoras: parseFloat(
            ((parseInt(timers.rows[0].total_segundos) || 0) / 3600).toFixed(2),
          ),
        },
        streak: streaks.rows[0]
          ? {
              atual: streaks.rows[0].current_streak,
              maximo: streaks.rows[0].max_streak,
            }
          : null,
      });
    } catch (e) {
      logger.error("Erro nucleo progress:", e);
      res.status(500).json({ success: false, message: "Erro interno" });
    }
  }

  static async getXpHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { limit = 20, nucleoId } = req.query as any;
      let sql = `SELECT xl.*, n.nome AS nucleo_nome FROM xp_logs xl
                 LEFT JOIN nucleos n ON n.id=xl.nucleo_id
                 WHERE xl.user_id=$1`;
      const params: any[] = [userId];
      if (nucleoId) {
        sql += ` AND xl.nucleo_id=$${params.push(nucleoId)}`;
      }
      sql += ` ORDER BY xl.created_at DESC LIMIT $${params.push(parseInt(limit))}`;
      const rows = await pool.query(sql, params);
      res.json(
        rows.rows.map((r) => ({
          id: r.id,
          xpAmount: r.xp_amount,
          source: r.source,
          nucleoId: r.nucleo_id,
          nucleoNome: r.nucleo_nome,
          createdAt: r.created_at,
        })),
      );
    } catch (e) {
      logger.error("Erro xp history:", e);
      res.status(500).json({ success: false, message: "Erro interno" });
    }
  }
}
