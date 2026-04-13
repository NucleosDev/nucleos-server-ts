// src/jobs/calculate-streaks.job.ts
import { pool } from '../infrastructure/persistence/db/connection';
import { logger } from '../shared/utils/logger';

/**
 * Verifica todos os streaks e zera os que ficaram sem atividade por mais de 1 dia.
 * Rodar diariamente (meia-noite).
 */
export async function calculateStreaksJob(): Promise<void> {
  try {
    const result = await pool.query(
      `UPDATE streaks
       SET current_streak = 0, updated_at = NOW()
       WHERE last_activity_date < CURRENT_DATE - INTERVAL '1 day'
         AND current_streak > 0
       RETURNING id, user_id`,
    );
    logger.info(`calculateStreaksJob: ${result.rowCount} streaks zerados`);
  } catch (err) {
    logger.error('Erro no calculateStreaksJob:', err);
  }
}
