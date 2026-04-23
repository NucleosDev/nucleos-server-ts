// // src/domain/services/StreakDomainService.ts
// import { injectable } from "tsyringe";

// @injectable()
// export class StreakDomainService {
//   getStreakMilestone(
//     streakDays: number,
//   ): { milestone: number; reward: number; title: string } | null {
//     const milestones: Record<number, { reward: number; title: string }> = {
//       3: { reward: 50, title: "🔥 3 Dias - Início da Jornada!" },
//       7: { reward: 150, title: "⚡ 7 Dias - Consistência é o Segredo!" },
//       14: { reward: 300, title: "🌟 14 Dias - Você está voando!" },
//       30: { reward: 1000, title: "🏆 30 Dias - Mês de Ouro!" },
//       60: { reward: 2500, title: "💪 60 Dias - Força de Vontade!" },
//       100: { reward: 5000, title: "👑 100 Dias - Lenda!" },
//       365: { reward: 50000, title: "🎊 1 Ano - Campeão Absoluto!" },
//     };

//     if (milestones[streakDays]) {
//       return {
//         milestone: streakDays,
//         reward: milestones[streakDays].reward,
//         title: milestones[streakDays].title,
//       };
//     }
//     return null;
//   }

//   getStreakMessage(streakDays: number): string {
//     if (streakDays === 1) return "🎉 Primeiro dia! Continue assim!";
//     if (streakDays === 2) return "🌟 Dia 2! Você está no caminho certo!";
//     if (streakDays === 3) return "🔥 Streak de 3 dias! Incrível!";
//     if (streakDays === 7) return "⚡ SEMANA COMPLETA! Você é demais!";
//     if (streakDays === 30) return "🏆 MÊS COMPLETO! Lendário!";
//     if (streakDays === 100) return "👑 100 DIAS! Você é uma lenda!";
//     return `📅 Streak de ${streakDays} dias! Continue firme!`;
//   }
// }
