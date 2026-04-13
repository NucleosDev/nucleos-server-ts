// src/api/controllers/v1/ProgressController.ts
import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { logger } from "../../../shared/utils/logger";

export class ProgressController {
  static async getXp(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Não autenticado" });
        return;
      }

      const result = await pool.query(
        `SELECT COALESCE(SUM(xp_amount), 0) as total_xp
         FROM xp_logs WHERE user_id = $1`,
        [userId],
      );

      res.json({ totalXp: parseInt(result.rows[0].total_xp) });
    } catch (error) {
      logger.error("Erro ao buscar XP:", error);
      res.status(500).json({ success: false, message: "Erro interno" });
    }
  }

  static async getEnergy(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Não autenticado" });
        return;
      }

      const result = await pool.query(
        `SELECT COALESCE(SUM(energy_amount), 0) as total_energy
         FROM energy_logs WHERE user_id = $1`,
        [userId],
      );

      res.json({ totalEnergy: parseInt(result.rows[0].total_energy) });
    } catch (error) {
      logger.error("Erro ao buscar Energy:", error);
      res.status(500).json({ success: false, message: "Erro interno" });
    }
  }
}
