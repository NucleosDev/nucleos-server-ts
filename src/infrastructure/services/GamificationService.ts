// src/infrastructure/services/GamificationService.ts
import { UserLevelRepository } from "../persistence/repositories/UserLevelRepository";
import { StreakRepository } from "../persistence/repositories/StreakRepository";
import { XpLogRepository } from "../persistence/repositories/XpLogRepository";
import { ConquistaRepository } from "../persistence/repositories/ConquistaRepository";
import { emitToUser } from "../../api/socket";

export class GamificationService {
  private userLevelRepo: UserLevelRepository;
  private streakRepo: StreakRepository;
  private xpLogRepo: XpLogRepository;
  private conquistaRepo: ConquistaRepository;

  private readonly XP_VALUES: Record<string, number> = {
    CREATE_NUCLEO: 100,
    CREATE_BLOCO: 40,
    CREATE_TAREFA: 25,
    CREATE_HABITO: 30,
    COMPLETE_TAREFA: 50,
    REGISTER_HABITO: 30,
    DAILY_LOGIN: 20,
  };

  constructor() {
    this.userLevelRepo = new UserLevelRepository();
    this.streakRepo = new StreakRepository();
    this.xpLogRepo = new XpLogRepository();
    this.conquistaRepo = new ConquistaRepository();
  }

  async processAction(params: {
    userId: string;
    action: string;
    nucleoId?: string;
    metadata?: any;
  }): Promise<any> {
    const { userId, action, nucleoId } = params;

    const streak = await this.streakRepo.updateStreak(userId);

    // CORRIGIDO: garantir que currentStreak é número
    const currentStreak = streak?.currentStreak ?? 0;
    let xpAmount = this.XP_VALUES[action] || 10;

    if (currentStreak >= 100) xpAmount *= 2.5;
    else if (currentStreak >= 30) xpAmount *= 2.0;
    else if (currentStreak >= 7) xpAmount *= 1.5;
    else if (currentStreak >= 3) xpAmount *= 1.2;
    xpAmount = Math.floor(xpAmount);

    const todayXp = await this.xpLogRepo.getTodayXp(userId);
    if (todayXp === 0) xpAmount += 50;

    const levelResult = await this.userLevelRepo.addXp(
      userId,
      xpAmount,
      action,
      nucleoId,
    );

    const streakMilestones: Record<number, number> = {
      3: 50,
      7: 150,
      14: 300,
      30: 1000,
      60: 2500,
      100: 5000,
      365: 50000,
    };
    if (streakMilestones[currentStreak]) {
      await this.userLevelRepo.addXp(
        userId,
        streakMilestones[currentStreak],
        "STREAK_MILESTONE",
        nucleoId,
      );
    }

    const achievements = await this.checkAchievements(userId);

    if (xpAmount > 0) {
      emitToUser(userId, "gamification:xp", {
        xp: xpAmount,
        newTotal: levelResult.newLevel,
        source: action,
        timestamp: new Date(),
      });
    }

    if (levelResult.leveledUp) {
      emitToUser(userId, "gamification:levelUp", {
        newLevel: levelResult.newLevel,
        oldLevel: levelResult.newLevel - 1,
        message: `Parabéns! Você alcançou o nível ${levelResult.newLevel}!`,
      });
    }

    return {
      xpGained: xpAmount,
      leveledUp: levelResult.leveledUp,
      newLevel: levelResult.newLevel,
      currentStreak: currentStreak,
      achievements,
    };
  }

  private async checkAchievements(userId: string): Promise<any[]> {
    const unlocked: any[] = [];
    const all = await this.conquistaRepo.findAll();
    const userUnlocked = await this.conquistaRepo.findUnlockedByUser(userId);
    const unlockedIds = userUnlocked.map((a) => a.id);
    const stats = await this.xpLogRepo.getUserStats(userId);
    const streak = await this.streakRepo.findByUserId(userId);
    const level = await this.userLevelRepo.findByUserId(userId);

    for (const ach of all) {
      if (unlockedIds.includes(ach.id)) continue;
      const cond = ach.condicao;
      let met = false;
      if (cond.type === "count") met = stats.totalActions >= cond.target;
      else if (cond.type === "streak")
        met = (streak?.currentStreak ?? 0) >= cond.target;
      else if (cond.type === "level") met = (level?.level ?? 0) >= cond.target;

      if (met) {
        await this.conquistaRepo.unlock(userId, ach.id);
        await this.userLevelRepo.addXp(
          userId,
          ach.xp_recompensa,
          "ACHIEVEMENT",
        );
        unlocked.push(ach);
      }
    }
    return unlocked;
  }

  async getUserStats(userId: string): Promise<any> {
    const level = await this.userLevelRepo.findByUserId(userId);
    const streak = await this.streakRepo.findByUserId(userId);
    const achievements = await this.conquistaRepo.findUnlockedByUser(userId);
    const todayXp = await this.xpLogRepo.getTodayXp(userId);

    // Buscar última ação do usuário
    const lastActionResult = await this.xpLogRepo.query(
      `SELECT created_at FROM xp_logs 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT 1`,
      [userId],
    );

    const lastActionDate = lastActionResult?.rows?.[0]?.created_at || null;

    return {
      level: level?.level || 1,
      currentXp: level?.currentXp || 0,
      nextLevelXp: level?.nextLevelXp || 100,
      totalXp: level?.totalXpEarned || 0,
      currentStreak: streak?.currentStreak || 0,
      maxStreak: streak?.maxStreak || 0,
      achievementsCount: achievements.length,
      todayXp,
      lastActionDate, //ADICIONAR
      progressToNextLevel:
        ((level?.currentXp || 0) / (level?.nextLevelXp || 100)) * 100,
    };
  }

  async getLeaderboard(limit: number = 10): Promise<any[]> {
    return this.userLevelRepo.getLeaderboard(limit);
  }
}
