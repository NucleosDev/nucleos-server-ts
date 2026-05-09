export class GamificacaoDomainService {
  private static readonly BASE_XP = 100;
  private static readonly GROWTH_FACTOR = 1.5;

  static xpForLevel(level: number): number {
    return Math.floor(
      GamificacaoDomainService.BASE_XP *
        Math.pow(GamificacaoDomainService.GROWTH_FACTOR, level - 1),
    );
  }

  static levelFromXp(totalXp: number): number {
    let level = 1;
    let accumulated = 0;
    while (true) {
      const needed = GamificacaoDomainService.xpForLevel(level);
      if (accumulated + needed > totalXp) break;
      accumulated += needed;
      level++;
    }
    return level;
  }

  static xpForAction(action: XpAction): number {
    return XP_TABLE[action] ?? 0;
  }
}

export type XpAction =
  | "task_complete"
  | "habit_register"
  | "habit_streak_7"
  | "habit_streak_30"
  | "login_daily"
  | "nucleo_create"
  | "first_task"
  | "timer_complete";

export const XP_TABLE: Record<XpAction, number> = {
  task_complete: 10,
  habit_register: 15,
  habit_streak_7: 50,
  habit_streak_30: 200,
  login_daily: 5,
  nucleo_create: 20,
  first_task: 25,
  timer_complete: 10,
};
