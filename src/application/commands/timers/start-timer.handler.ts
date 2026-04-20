import { Timer } from "../../../domain/entities/Timer";
import { TimerRepository } from "../../../infrastructure/persistence/repositories/TimerRepository";
import { NucleoRepository } from "../../../infrastructure/persistence/repositories/NucleoRepository";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";
import { StartTimerCommand } from "./start-timer.command";

export class StartTimerHandler {
  private timerRepository: TimerRepository;
  private nucleoRepository: NucleoRepository;

  constructor() {
    this.timerRepository = new TimerRepository();
    this.nucleoRepository = new NucleoRepository();
  }

  async execute(command: StartTimerCommand): Promise<any> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const nucleo = await this.nucleoRepository.findById(
        command.nucleoId,
        command.userId,
      );

      if (!nucleo) {
        throw new NotFoundException("Núcleo", command.nucleoId);
      }

      const activeTimer = await this.timerRepository.findActiveByNucleoId(
        command.nucleoId,
      );
      if (activeTimer) {
        throw new Error("Já existe um timer ativo para este núcleo");
      }

      const timer = Timer.create({
        nucleoId: command.nucleoId,
        titulo: command.titulo || "Sessão de foco",
        inicio: new Date(),
        duracaoSegundos: command.duracaoSegundos || null,
        modo: command.modo || "crescente",
      });

      const saved = await this.timerRepository.createWithClient(client, timer);

      await client.query("COMMIT");

      return {
        id: saved.id,
        nucleoId: saved.nucleoId,
        titulo: saved.titulo,
        inicio: saved.inicio.toISOString(),
        fim: saved.fim?.toISOString() || null,
        duracaoSegundos: saved.duracaoSegundos,
        modo: saved.modo,
        createdAt: saved.createdAt.toISOString(),
        updatedAt: saved.updatedAt.toISOString(),
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
