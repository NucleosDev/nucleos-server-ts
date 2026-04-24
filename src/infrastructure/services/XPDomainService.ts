// // src/domain/services/XPDomainService.ts
// import { injectable } from "tsyringe";

// @injectable()
// export class XPDomainService {
//   private readonly XP_VALUES: Record<string, number> = {
//     CREATE_NUCLEO: 100,
//     CREATE_BLOCO: 40,
//     CREATE_TAREFA: 25,
//     CREATE_HABITO: 30,
//     CREATE_LISTA: 20,
//     CREATE_ITEM_LISTA: 5,
//     CREATE_COLECAO: 35,
//     CREATE_EVENTO: 30,
//     CREATE_TIMER: 15,
//     COMPLETE_TAREFA: 50,
//     REGISTER_HABITO: 30,
//     CHECK_ITEM_LISTA: 10,
//     COMPLETE_TIMER: 25,
//     DAILY_LOGIN: 20,
//   };

//   getBaseXP(action: string): number {
//     return this.XP_VALUES[action] || 10;
//   }

//   calculateXPWithStreak(baseXP: number, streakDays: number): number {
//     let multiplier = 1;
//     if (streakDays >= 100) multiplier = 2.5;
//     else if (streakDays >= 30) multiplier = 2.0;
//     else if (streakDays >= 7) multiplier = 1.5;
//     else if (streakDays >= 3) multiplier = 1.2;

//     return Math.floor(baseXP * multiplier);
//   }
// }
