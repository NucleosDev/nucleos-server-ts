import { Habito, FrequenciaHabito } from "../../../domain/entities/Habito";
import { IHabitoRepository } from "../../../domain/repositories/IHabitoRepository";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { CreateHabitoCommand } from "./CreateHabitoCommand";
import { HabitoResponseDto } from "../../dto/habito.dto";

export class CreateHabitoHandler {
  constructor(private readonly habitoRepository: IHabitoRepository) {}

  async execute(command: CreateHabitoCommand): Promise<HabitoResponseDto> {
    const blocoCheck = await pool.query(
      `SELECT n.user_id 
       FROM blocos b
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE b.id = $1 AND b.deleted_at IS NULL`,
      [command.blocoId],
    );

    if (blocoCheck.rows.length === 0) {
      throw new Error("Bloco não encontrado");
    }

    if (blocoCheck.rows[0].user_id !== command.userId) {
      throw new Error("Acesso negado");
    }

    const frequencia: FrequenciaHabito = command.frequencia || "diaria";

    const habito = Habito.create({
      blocoId: command.blocoId,
      nome: command.nome,
      frequencia,
      diasSemana: command.diasSemana,
      metaVezes: command.metaVezes,
    });

    await this.habitoRepository.save(habito);

    return {
      id: habito.id,
      blocoId: habito.blocoId,
      nome: habito.nome,
      frequencia: habito.frequencia,
      diasSemana: habito.diasSemana,
      metaVezes: habito.metaVezes,
      streakAtual: 0,
      streakMaximo: 0,
      completoHoje: false,
      createdAt: habito.createdAt.toISOString(),
      updatedAt: habito.updatedAt.toISOString(),
    };
  }
}
