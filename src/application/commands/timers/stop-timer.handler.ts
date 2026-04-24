// application/commands/timers/stop-timer.handler.ts
import { TimerRepository } from "../../../infrastructure/persistence/repositories/TimerRepository";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";
import { StopTimerCommand } from "./stop-timer.command";
import { NotificationsController } from "../../../api/controllers/v1/NotificationsController";
import { Timer } from "../../../domain/entities/Timer";
export class StopTimerHandler {
  private timerRepository: TimerRepository;

  constructor() {
    this.timerRepository = new TimerRepository();
  }

  async execute(command: StopTimerCommand): Promise<any> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const timer = await this.timerRepository.findById(command.id);

      if (!timer) {
        throw new NotFoundException("Timer", command.id);
      }

      const nucleoCheck = await client.query(
        `SELECT n.user_id FROM timers t
       JOIN nucleos n ON n.id = t.nucleo_id
       WHERE t.id = $1`,
        [command.id],
      );

      if (
        nucleoCheck.rows.length === 0 ||
        nucleoCheck.rows[0].user_id !== command.userId
      ) {
        throw new ForbiddenException("Sem permissão para parar este timer");
      }

      if (!timer.isRunning) {
        throw new Error("Timer já está parado");
      }

      timer.stop();
      await this.timerRepository.update(timer);

      const xpAmount = Math.floor((timer.duracaoSegundos || 0) / 60);
      if (xpAmount > 0) {
        await client.query(
          `INSERT INTO xp_logs (user_id, nucleo_id, xp_amount, source, created_at)
         VALUES ($1, $2, $3, 'timer', NOW())`,
          [command.userId, timer.nucleoId, xpAmount],
        );
      }

      await NotificationsController.createNotification(
        command.userId,
        "Timer Completado!",
        `Você completou um timer de ${Math.floor((timer.duracaoSegundos || 0) / 60)} minutos e ganhou ${xpAmount} XP!`,
      );

      await client.query("COMMIT");

      return {
        duracaoSegundos: timer.duracaoSegundos || 0,
        xpGanho: xpAmount,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
