// // src/domain/services/LevelService.ts
// import { injectable } from "tsyringe";

// @injectable()
// export class LevelService {
//   private readonly BASE_XP = 100;
//   private readonly GROWTH_FACTOR = 1.5;
//   private readonly MAX_LEVEL = 100;

//   getXPForLevel(level: number): number {
//     if (level <= 1) return this.BASE_XP;
//     return Math.floor(this.BASE_XP * Math.pow(this.GROWTH_FACTOR, level - 1));
//   }

//   getLevelFromXP(xp: number): {
//     level: number;
//     currentXP: number;
//     nextLevelXP: number;
//   } {
//     let level = 1;
//     let remainingXP = xp;
//     let nextLevelXP = this.getXPForLevel(level);

//     while (remainingXP >= nextLevelXP && level < this.MAX_LEVEL) {
//       remainingXP -= nextLevelXP;
//       level++;
//       nextLevelXP = this.getXPForLevel(level);
//     }

//     return {
//       level,
//       currentXP: remainingXP,
//       nextLevelXP,
//     };
//   }

//   getLevelTitle(level: number): string {
//     if (level >= 100) return "👑 Mestre Supremo";
//     if (level >= 80) return "🌟 Lenda Viva";
//     if (level >= 60) return "⚡ Mestre Experiente";
//     if (level >= 40) return "💪 Guerreiro Dedicado";
//     if (level >= 20) return "🔥 Aprendiz Avançado";
//     if (level >= 10) return "📚 Aprendiz";
//     if (level >= 5) return "🌱 Iniciante";
//     return "🆕 Novo Explorador";
//   }
// }
