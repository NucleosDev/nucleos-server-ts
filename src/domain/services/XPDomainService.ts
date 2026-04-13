import { UserLevel } from "../entities/UserLevel";
import { XpLog } from "../entities/XpLog";
import { CONFIG } from "../../shared/constants/config";

export class XPDomainService {
  /** Adiciona XP ao level e retorna o XpLog e info de level-up. */
  addXp(
    level: UserLevel,
    amount: number,
    source: string,
    userId: string,
    nucleoId?: string,
  ): { leveledUp: boolean; newLevel: number; xpLog: XpLog } {
    const { leveledUp, newLevel } = level.addXp(amount);
    const xpLog = new XpLog({ userId, nucleoId, xpAmount: amount, source });
    return { leveledUp, newLevel, xpLog };
  }

  getXpForAction(action: keyof typeof CONFIG.XP): number {
    return CONFIG.XP[action];
  }
}
