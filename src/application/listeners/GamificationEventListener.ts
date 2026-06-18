import { eventDispatcher } from "../../shared/EventDispatcher";
import { GamificationService } from "../../infrastructure/services/GamificationService";
import { logger } from "../../shared/utils/logger";

const gamificationService = new GamificationService();

const EVENT_ACTION_MAP: Record<string, string> = {
  TarefaConcluidaEvent: "COMPLETE_TAREFA",
  HabitoRegistradoEvent: "REGISTER_HABITO",
  NucleoCriadoEvent: "CREATE_NUCLEO",
  BlocoCriadoEvent: "CREATE_BLOCO",
  TimerCompletadoEvent: "COMPLETE_TIMER",
  ItemListaCheckedEvent: "CHECK_ITEM_LISTA",
  UserLoginEvent: "DAILY_LOGIN",
};

export function registerGamificationListeners(): void {
  Object.entries(EVENT_ACTION_MAP).forEach(([eventName, action]) => {
    eventDispatcher.register(eventName, async (event: any) => {
      logger.info(`[Gamification] ${eventName} -> ${action}`);

      try {
        const result = await gamificationService.processAction({
          userId: event.userId,
          action,
          nucleoId: event.nucleoId,
          metadata: event,
        });

        logger.info(
          `[Gamification] +${result.xpGained} XP, streak: ${result.currentStreak}`,
        );

        if (result.leveledUp) {
          logger.info(
            `[Gamification] level up — user ${event.userId} agora é nível ${result.newLevel}`,
          );
        }

        if (result.achievements.length > 0) {
          logger.info(
            `[Gamification] conquistas: ${result.achievements.map((a: any) => a.nome).join(", ")}`,
          );
        }
      } catch (error) {
        logger.error(`[Gamification] erro em ${eventName}:`, error);
      }
    });
  });

  logger.info("[Gamification] listeners registrados");
}
