// import { DataSource } from "typeorm";
// import { GamificacaoService } from "../../application/features/gamificacao/commands/gamificacaoCalculosIAAdminService";
// import cron from "node-cron";
// import { logger } from "../../application/common/behaviours";

// // ─── LevelCalculator ──────────────────────────────────────────────────────────
// export class LevelCalculator {
//   static xpForLevel(level: number): number {
//     return level * 100;
//   }

//   static levelFromXP(totalXP: number): number {
//     let level = 1;
//     let accumulated = 0;
//     while (accumulated + this.xpForLevel(level) <= totalXP) {
//       accumulated += this.xpForLevel(level);
//       level++;
//     }
//     return level;
//   }
// }

// // ─── StreakCalculator ─────────────────────────────────────────────────────────
// export class StreakCalculator {
//   static isConsecutive(dates: Date[]): number {
//     if (dates.length === 0) return 0;
//     const sorted = [...dates].sort((a, b) => b.getTime() - a.getTime());
//     let streak = 1;
//     for (let i = 0; i < sorted.length - 1; i++) {
//       const diff = Math.floor(
//         (sorted[i].getTime() - sorted[i + 1].getTime()) / 86400000,
//       );
//       if (diff === 1) streak++;
//       else break;
//     }
//     return streak;
//   }
// }

// // ─── ConquistaChecker ─────────────────────────────────────────────────────────
// export class ConquistaChecker {
//   constructor(
//     private readonly dataSource: DataSource,
//     private readonly gamificacao: GamificacaoService,
//   ) {}

//   async check(userId: string): Promise<void> {
//     // First task completed
//     const [tarefas] = await this.dataSource.query(
//       `SELECT COUNT(*) AS c FROM tarefas WHERE user_id=$1 AND status='CONCLUIDA' AND is_deleted=false`,
//       [userId],
//     );
//     if (parseInt(tarefas?.c ?? "0") >= 1) {
//       await this.gamificacao.desbloquearConquista({
//         userId,
//         conquistaKey: "PRIMEIRA_TAREFA",
//       });
//     }
//     if (parseInt(tarefas?.c ?? "0") >= 10) {
//       await this.gamificacao.desbloquearConquista({
//         userId,
//         conquistaKey: "DEZ_TAREFAS",
//       });
//     }

//     // First habit registered
//     const [habitos] = await this.dataSource.query(
//       `SELECT COUNT(*) AS c FROM habito_registros WHERE user_id=$1`,
//       [userId],
//     );
//     if (parseInt(habitos?.c ?? "0") >= 1) {
//       await this.gamificacao.desbloquearConquista({
//         userId,
//         conquistaKey: "PRIMEIRO_HABITO",
//       });
//     }
//   }
// }

// // ─── Background Jobs ──────────────────────────────────────────────────────────
// export class BackgroundJobsService {
//   private dataSource: DataSource;
//   private gamificacao: GamificacaoService;

//   constructor(dataSource: DataSource) {
//     this.dataSource = dataSource;
//     this.gamificacao = new GamificacaoService(dataSource);
//   }

//   start(): void {
//     // Calculate streaks daily at midnight
//     cron.schedule("0 0 * * *", async () => {
//       logger.info("Running: CalculateStreaksJob");
//       try {
//         const users = await this.dataSource.query(
//           `SELECT DISTINCT user_id FROM habito_registros`,
//         );
//         for (const { user_id } of users) {
//           await this.gamificacao.atualizarStreak({
//             userId: user_id,
//             type: "HABITO",
//           });
//         }
//       } catch (err) {
//         logger.error("CalculateStreaksJob error", err);
//       }
//     });

//     // Generate insights weekly on Mondays at 8am
//     cron.schedule("0 8 * * 1", async () => {
//       logger.info("Running: GenerateInsightsJob");
//       try {
//         const users = await this.dataSource.query(
//           `SELECT id FROM users WHERE is_active=true AND is_deleted=false`,
//         );
//         logger.info(`Queued insights generation for ${users.length} users`);
//       } catch (err) {
//         logger.error("GenerateInsightsJob error", err);
//       }
//     });

//     logger.info(" Background jobs scheduled");
//   }
// }
