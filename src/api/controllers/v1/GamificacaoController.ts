// src/api/controllers/v1/GamificacaoController.ts
import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { GamificationService } from "../../../infrastructure/services/GamificationService";
import { ConquistaRepository } from "../../../infrastructure/persistence/repositories/ConquistaRepository";
import { UserLevelRepository } from "../../../infrastructure/persistence/repositories/UserLevelRepository";
import { StreakRepository } from "../../../infrastructure/persistence/repositories/StreakRepository";
import { XpLogRepository } from "../../../infrastructure/persistence/repositories/XpLogRepository";

export class GamificacaoController {
  private gamificationService: GamificationService;
  private conquistaRepo: ConquistaRepository;
  private userLevelRepo: UserLevelRepository;
  private streakRepo: StreakRepository;
  private xpLogRepo: XpLogRepository;

  constructor() {
    this.gamificationService = new GamificationService();
    this.conquistaRepo = new ConquistaRepository();
    this.userLevelRepo = new UserLevelRepository();
    this.streakRepo = new StreakRepository();
    this.xpLogRepo = new XpLogRepository();
  }

  // GET /gamification/stats
  async getUserStats(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Não autenticado" });
      }

      const level = await this.userLevelRepo.findByUserId(userId);
      const streak = await this.streakRepo.findByUserId(userId);
      const achievements = await this.conquistaRepo.findUnlockedByUser(userId);
      const todayXp = await this.xpLogRepo.getTodayXp(userId);
      const userStats = await this.xpLogRepo.getUserStats(userId);

      const stats = {
        level: level?.level || 1,
        currentXp: level?.currentXp || 0,
        nextLevelXp: level?.nextLevelXp || 100,
        totalXp: level?.totalXpEarned || 0,
        currentStreak: streak?.currentStreak || 0,
        maxStreak: streak?.maxStreak || 0,
        achievementsCount: achievements.length,
        todayXp: todayXp,
        totalActions: userStats.totalActions || 0,
        progressToNextLevel:
          ((level?.currentXp || 0) / (level?.nextLevelXp || 100)) * 100,
      };

      return res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error("[GamificacaoController] getUserStats error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /gamification/leaderboard
  async getLeaderboard(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await this.userLevelRepo.getLeaderboard(limit);
      return res.json({ success: true, data: leaderboard });
    } catch (error: any) {
      console.error("[GamificacaoController] getLeaderboard error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /gamification/achievements
  async getAchievements(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Não autenticado" });
      }

      const unlocked = await this.conquistaRepo.findUnlockedByUser(userId);
      const all = await this.conquistaRepo.findAll();

      const unlockedIds = new Set(unlocked.map((u) => u.id));
      const achievements = all.map((ach) => ({
        id: ach.id,
        nome: ach.nome,
        descricao: ach.descricao,
        tipo: ach.tipo,
        xp_recompensa: ach.xp_recompensa,
        unlocked: unlockedIds.has(ach.id),
        unlockedAt:
          unlocked.find((u) => u.id === ach.id)?.desbloqueado_em || null,
      }));

      return res.json({ success: true, data: achievements });
    } catch (error: any) {
      console.error("[GamificacaoController] getAchievements error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /gamification/history
  async getXpHistory(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Não autenticado" });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await this.xpLogRepo.query(
        `SELECT id, xp_amount, source, nucleo_id, created_at 
         FROM xp_logs 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset],
      );

      return res.json({ success: true, data: result.rows });
    } catch (error: any) {
      console.error("[GamificacaoController] getXpHistory error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /gamification/streak
  async getStreak(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Não autenticado" });
      }

      const streak = await this.streakRepo.findByUserId(userId);

      return res.json({
        success: true,
        data: {
          currentStreak: streak?.currentStreak || 0,
          maxStreak: streak?.maxStreak || 0,
          lastActivityDate: streak?.lastActivityDate || null,
        },
      });
    } catch (error: any) {
      console.error("[GamificacaoController] getStreak error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /gamification/process-action (para testes/webhook)
  async processAction(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Não autenticado" });
      }

      const { action, nucleoId, metadata } = req.body;
      if (!action) {
        return res
          .status(400)
          .json({ success: false, message: "Action é obrigatório" });
      }

      const result = await this.gamificationService.processAction({
        userId,
        action,
        nucleoId,
        metadata,
      });

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[GamificacaoController] processAction error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
