// src/jobs/index.ts
// Jobs desativados por padrão — habilitar conforme necessidade (ex: BullMQ, node-cron)
// import { calculateStreaksJob } from './calculate-streaks.job';
// import { sendNotificationsJob } from './send-notifications.job';
// import { generateInsightsJob } from './generate-insights.job';

export function initJobs(): void {
  // Exemplo com node-cron:
  // cron.schedule('0 0 * * *', calculateStreaksJob);
  // cron.schedule('*/30 * * * *', sendNotificationsJob);
  console.log('ℹ️  Jobs registrados (desativados em dev)');
}
