// src/jobs/calculate-streaks.job.ts
import cron from "node-cron";
import { pool } from "../infrastructure/persistence/db/connection";

// Executar todo dia à meia-noite
cron.schedule("0 0 * * *", async () => {
  console.log("[Streak Job] Running streak check...");
  try {
    await pool.query(
      `UPDATE streaks 
       SET current_streak = 0 
       WHERE last_activity_date < CURRENT_DATE - INTERVAL '2 days'`,
    );
    console.log("[Streak Job] Completed successfully");
  } catch (error) {
    console.error("[Streak Job] Error:", error);
  }
});
