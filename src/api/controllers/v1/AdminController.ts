import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { logger } from "../../../shared/utils/logger";

export class AdminController {
  static async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userRole = req.user?.role;
      if (userRole !== "admin") {
        res.status(403).json({ success: false, message: "Acesso negado" });
        return;
      }

      const result = await pool.query(
        `SELECT 
          (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) as total_usuarios,
          (SELECT COUNT(*) FROM nucleos WHERE deleted_at IS NULL) as total_nucleos,
          (SELECT COUNT(*) FROM tarefas WHERE deleted_at IS NULL AND status = 'concluida') as total_tarefas_concluidas,
          (SELECT COUNT(*) FROM habitos WHERE deleted_at IS NULL) as total_habitos,
          (SELECT COUNT(*) FROM subscriptions WHERE is_active = true) as assinaturas_ativas
         FROM users LIMIT 1`,
      );

      res.json(result.rows[0]);
    } catch (error) {
      logger.error("Erro ao buscar stats:", error);
      res.status(500).json({ success: false, message: "Erro interno" });
    }
  }

  static async getUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userRole = req.user?.role;
      if (userRole !== "admin") {
        res.status(403).json({ success: false, message: "Acesso negado" });
        return;
      }

      const { limit = 50, page = 1 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const result = await pool.query(
        `SELECT u.id, u.email, u.active, u.created_at,
                up.full_name,
                ur.role,
                ul.level
         FROM users u
         LEFT JOIN user_profiles up ON up.user_id = u.id
         LEFT JOIN user_roles ur ON ur.user_id = u.id
         LEFT JOIN user_levels ul ON ul.user_id = u.id
         WHERE u.deleted_at IS NULL
         ORDER BY u.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      );

      const countResult = await pool.query(
        `SELECT COUNT(*) FROM users WHERE deleted_at IS NULL`,
      );

      res.json({
        data: result.rows,
        pagination: {
          total: parseInt(countResult.rows[0].count),
          page: Number(page),
          limit: Number(limit),
        },
      });
    } catch (error) {
      logger.error("Erro ao listar usuários:", error);
      res.status(500).json({ success: false, message: "Erro interno" });
    }
  }
}
