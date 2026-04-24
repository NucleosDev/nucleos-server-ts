import { eventDispatcher } from "../../shared/EventDispatcher";
import { GamificationService } from "../../infrastructure/services/GamificationService";

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
      console.log(`[Gamification] Processing event: ${eventName} -> ${action}`);

      try {
        const result = await gamificationService.processAction({
          userId: event.userId,
          action,
          nucleoId: event.nucleoId,
          metadata: event,
        });

        console.log(
          `[Gamification] Result: +${result.xpGained} XP, Streak: ${result.currentStreak}`,
        );

        if (result.leveledUp) {
          console.log(
            `[Gamification] Level Up! User ${event.userId} is now level ${result.newLevel}`,
          );
        }

        if (result.achievements.length > 0) {
          console.log(
            `[Gamification] Achievements unlocked: ${result.achievements.map((a: any) => a.nome).join(", ")}`,
          );
        }
      } catch (error) {
        console.error(`[Gamification] Error processing ${eventName}:`, error);
      }
    });
  });

  console.log("[Gamification] All event listeners registered");
}
