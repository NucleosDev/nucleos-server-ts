import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { logger } from "../../../shared/utils/logger";


export class PlansController {
  static async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await pool.query(
        `SELECT id, name, max_nucleos, max_blocos_por_nucleo, max_membros_por_nucleo, price, features, created_at
         FROM plans ORDER BY price ASC`,
      );

      res.json(result.rows);
    } catch (error) {
      logger.error("Erro ao listar planos:", error);
      res.status(500).json({ success: false, message: "Erro interno" });
    }
  }

  static async getCurrentSubscription(
    req: AuthRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Não autenticado" });
        return;
      }

      const result = await pool.query(
        `SELECT s.id, s.plan_id, p.name, p.max_nucleos, p.max_blocos_por_nucleo, p.max_membros_por_nucleo,
                s.started_at, s.expires_at, s.is_active, s.cancel_at_period_end
         FROM subscriptions s
         JOIN plans p ON p.id = s.plan_id
         WHERE s.user_id = $1 AND s.is_active = true
         LIMIT 1`,
        [userId],
      );

      if (result.rows.length === 0) {
        const freePlan = await pool.query(
          `SELECT id, name, max_nucleos, max_blocos_por_nucleo, max_membros_por_nucleo, price, features
           FROM plans WHERE name = 'free' LIMIT 1`,
        );

        if (freePlan.rows.length > 0) {
          res.json({ ...freePlan.rows[0], isActive: false });
          return;
        }

        res
          .status(404)
          .json({ success: false, message: "Nenhum plano encontrado" });
        return;
      }

      res.json(result.rows[0]);
    } catch (error) {
      logger.error("Erro ao buscar assinatura:", error);
      res.status(500).json({ success: false, message: "Erro interno" });
    }
  }
}
// falta ajustar calendario