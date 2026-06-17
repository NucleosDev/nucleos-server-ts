import { Habito, FrequenciaHabito } from "../../../domain/entities/Habito";
import { IHabitoRepository } from "../../../domain/repositories/IHabitoRepository";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { CreateHabitoCommand } from "./CreateHabitoCommand";
import { HabitoResponseDto } from "../../dto/habito.dto";
import {
  deleteCache,
  CacheKeys,
} from "../../../infrastructure/cache/redis.service";

export class CreateHabitoHandler {
  constructor(private readonly habitoRepository: IHabitoRepository) {}

  async execute(command: CreateHabitoCommand): Promise<HabitoResponseDto> {
    const blocoCheck = await pool.query(
      `SELECT n.user_id
       FROM blocos b
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE b.id = $1`,
      [command.blocoId],
    );

    if (blocoCheck.rows.length === 0) throw new Error("Bloco não encontrado");
    if (blocoCheck.rows[0].user_id !== command.userId) throw new Error("Acesso negado");

    const frequencia: FrequenciaHabito = command.frequencia || "diaria";

    let diasSemana: number[] | undefined = undefined;
    if (command.diasSemana) {
      if (Array.isArray(command.diasSemana)) {
        diasSemana = command.diasSemana
          .map(Number)
          .filter((n) => !isNaN(n) && n >= 0 && n <= 6);
      } else if (typeof command.diasSemana === "string") {
        try {
          const parsed = JSON.parse(command.diasSemana);
          if (Array.isArray(parsed)) {
            diasSemana = parsed.map(Number).filter((n) => !isNaN(n) && n >= 0 && n <= 6);
          }
        } catch {}
      }
    }

    const metaVezes = command.metaVezes ? Number(command.metaVezes) : undefined;

    const habito = Habito.create({
      blocoId: command.blocoId,
      nome: command.nome,
      frequencia,
      diasSemana,
      metaVezes,
    });

    await this.habitoRepository.save(habito);
    await deleteCache(CacheKeys.habitosByBloco(command.blocoId));

    return {
      id: habito.id,
      blocoId: habito.blocoId,
      nome: habito.nome,
      frequencia: habito.frequencia,
      diasSemana: habito.diasSemana || [],
      metaVezes: habito.metaVezes || 1,
      streakAtual: 0,
      streakMaximo: 0,
      completoHoje: false,
      createdAt: habito.createdAt.toISOString(),
      updatedAt: habito.updatedAt.toISOString(),
    };
  }
}
