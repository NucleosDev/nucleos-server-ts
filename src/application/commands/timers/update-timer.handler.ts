// application/commands/timers/update-timer.handler.ts
import { TimerRepository } from "../../../infrastructure/persistence/repositories/TimerRepository";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";
import { UpdateTimerCommand } from "./update-timer.command";

export class UpdateTimerHandler {
  private timerRepository: TimerRepository;

  constructor() {
    this.timerRepository = new TimerRepository();
  }

  async execute(command: UpdateTimerCommand): Promise<any> {
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
        throw new ForbiddenException("Sem permissão para editar este timer");
      }

      await client.query(
        `UPDATE timers SET titulo = $1, updated_at = NOW() WHERE id = $2`,
        [command.titulo, command.id],
      );

      await client.query("COMMIT");

      const updated = await this.timerRepository.findById(command.id);
      return {
        id: updated!.id,
        nucleoId: updated!.nucleoId,
        titulo: updated!.titulo,
        inicio: updated!.inicio.toISOString(),
        fim: updated!.fim?.toISOString() || null,
        duracaoSegundos: updated!.duracaoSegundos,
        modo: updated!.modo,
        createdAt: updated!.createdAt.toISOString(),
        updatedAt: updated!.updatedAt.toISOString(),
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
