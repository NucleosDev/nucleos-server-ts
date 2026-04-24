// src/api/controllers/v1/ProgressController.ts
import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { GamificationService } from "../../../infrastructure/services/GamificationService";
import { logger } from "../../../shared/utils/logger";

export class ProgressController {
  private static gamificationService = new GamificationService();

  // GET /progress/xp - Buscar XP do usuário
  static async getXp(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Não autenticado" });
        return;
      }

      const stats =
        await ProgressController.gamificationService.getUserStats(userId);

      res.json({
        success: true,
        data: {
          level: stats.level,
          currentXp: stats.currentXp,
          nextLevelXp: stats.nextLevelXp,
          totalXp: stats.totalXp,
          progressToNextLevel: stats.progressToNextLevel,
          lastActionDate: stats.lastActionDate,
        },
      });
    } catch (error) {
      logger.error("Erro ao buscar XP:", error);
      res
        .status(500)
        .json({ success: false, message: "Erro interno ao buscar XP" });
    }
  }

  // GET /progress/energy - Buscar energia do usuário
  static async getEnergy(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Não autenticado" });
        return;
      }

      const stats =
        await ProgressController.gamificationService.getUserStats(userId);

      const baseEnergy = 100;
      const levelBonus = Math.min(stats.level * 2, 50);
      const streakBonus = Math.min(stats.currentStreak, 30);
      const actionBonus = Math.min(stats.todayXp / 10, 20);

      let energy = baseEnergy + levelBonus + streakBonus + actionBonus;
      energy = Math.min(energy, 200);

      let regenAmount = 0;
      if (stats.lastActionDate) {
        const minutesSinceLastAction = Math.floor(
          (new Date().getTime() - new Date(stats.lastActionDate).getTime()) /
            (1000 * 60),
        );
        regenAmount = Math.min(Math.floor(minutesSinceLastAction / 5), 20);
        energy = Math.min(energy + regenAmount, 200);
      }

      res.json({
        success: true,
        data: {
          energy: Math.floor(energy),
          maxEnergy: 200,
          baseEnergy: baseEnergy,
          levelBonus: levelBonus,
          streakBonus: streakBonus,
          actionBonus: actionBonus,
          regenAmount: regenAmount,
          lastActionDate: stats.lastActionDate,
        },
      });
    } catch (error) {
      logger.error("Erro ao buscar energia:", error);
      res.json({
        success: true,
        data: {
          energy: 100,
          maxEnergy: 100,
          baseEnergy: 100,
          levelBonus: 0,
          streakBonus: 0,
          actionBonus: 0,
          regenAmount: 0,
          lastActionDate: null,
        },
      });
    }
  }

  // POST /progress/energy/consume - Consumir energia
  static async consumeEnergy(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { amount = 10, action } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: "Não autenticado" });
        return;
      }

      if (!amount || amount <= 0) {
        res
          .status(400)
          .json({ success: false, message: "Quantidade de energia inválida" });
        return;
      }

      const stats =
        await ProgressController.gamificationService.getUserStats(userId);

      const baseEnergy = 100;
      const levelBonus = Math.min(stats.level * 2, 50);
      const streakBonus = Math.min(stats.currentStreak, 30);
      const actionBonus = Math.min(stats.todayXp / 10, 20);
      const currentEnergy = Math.min(
        baseEnergy + levelBonus + streakBonus + actionBonus,
        200,
      );

      if (currentEnergy < amount) {
        res.status(400).json({
          success: false,
          message: "Energia insuficiente",
          data: {
            energy: currentEnergy,
            required: amount,
            missing: amount - currentEnergy,
          },
        });
        return;
      }

      // TODO: Registrar consumo em uma tabela de logs se necessário
      logger.info(
        `[ENERGY] Usuário ${userId} consumiu ${amount} de energia para ação: ${action || "desconhecida"}`,
      );

      res.json({
        success: true,
        message: "Energia consumida com sucesso",
        data: {
          consumed: amount,
          remaining: currentEnergy - amount,
          action: action || "desconhecida",
          timestamp: new Date(),
        },
      });
    } catch (error) {
      logger.error("Erro ao consumir energia:", error);
      res
        .status(500)
        .json({ success: false, message: "Erro interno ao consumir energia" });
    }
  }
}
