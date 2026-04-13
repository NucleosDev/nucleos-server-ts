// src/jobs/send-notifications.job.ts
import { pool } from "../infrastructure/persistence/db/connection";
import { logger } from "../shared/utils/logger";


// Cria notificações para tarefas vencendo nas próximas 24h.

export async function sendNotificationsJob(): Promise<void> {
  try {
    const result = await pool.query(
      `SELECT t.id, t.titulo, n.user_id, b.id AS bloco_id
       FROM tarefas t
       JOIN blocos b ON b.id = t.bloco_id
       JOIN nucleos n ON n.id = b.nucleo_id
       WHERE t.status = 'pendente'
         AND t.data_vencimento BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
         AND t.deleted_at IS NULL`,
    );

    for (const row of result.rows) {
      await pool.query(
        `INSERT INTO notifications (id, user_id, titulo, mensagem, read, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, false, NOW())
         ON CONFLICT DO NOTHING`,
        [
          row.user_id,
          "Tarefa vencendo!",
          `A tarefa "${row.titulo}" vence em breve.`,
        ],
      );
    }

    logger.info(
      `sendNotificationsJob: ${result.rowCount} notificações criadas`,
    );
  } catch (err) {
    logger.error("Erro no sendNotificationsJob:", err);
  }
}
