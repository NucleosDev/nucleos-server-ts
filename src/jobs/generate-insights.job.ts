// src/jobs/generate-insights.job.ts
import { pool } from '../infrastructure/persistence/db/connection';
import { logger } from '../shared/utils/logger';

/**
 * Gera insights básicos de produtividade sem IA (regras simples).
 */
export async function generateInsightsJob(): Promise<void> {
  try {
    // Usuários com streak zerado há 3 dias
    await pool.query(
      `INSERT INTO ai_insights (id, user_id, insight_type, mensagem, priority, applied, created_at)
       SELECT gen_random_uuid(), user_id, 'streak', 'Seu streak foi zerado. Que tal retomar hoje?', 3, false, NOW()
       FROM streaks
       WHERE current_streak = 0
         AND last_activity_date < CURRENT_DATE - INTERVAL '3 days'
         AND NOT EXISTS (
           SELECT 1 FROM ai_insights ai
           WHERE ai.user_id = streaks.user_id
             AND ai.insight_type = 'streak'
             AND ai.created_at > NOW() - INTERVAL '7 days'
         )`,
    );

    logger.info('generateInsightsJob: concluído');
  } catch (err) {
    logger.error('Erro no generateInsightsJob:', err);
  }
}
