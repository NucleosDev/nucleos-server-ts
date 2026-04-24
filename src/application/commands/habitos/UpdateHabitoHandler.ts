import { IHabitoRepository } from "../../../domain/repositories/IHabitoRepository";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { UpdateHabitoCommand } from "./UpdateHabitoCommand";
import { HabitoResponseDto } from "../../dto/habito.dto";

export class UpdateHabitoHandler {
  constructor(private readonly habitoRepository: IHabitoRepository) {}

  async execute(command: UpdateHabitoCommand): Promise<HabitoResponseDto> {
    const habitoCheck = await pool.query(
      `SELECT h.*, n.user_id
       FROM habitos h
       JOIN blocos b ON h.bloco_id = b.id
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE h.id = $1 AND h.deleted_at IS NULL`,
      [command.id],
    );

    if (habitoCheck.rows.length === 0) {
      throw new Error("Hábito não encontrado");
    }

    if (habitoCheck.rows[0].user_id !== command.userId) {
      throw new Error("Acesso negado");
    }

    const habito = await this.habitoRepository.findById(command.id);
    if (!habito) throw new Error("Hábito não encontrado");

    if (command.nome) habito.updateNome(command.nome);
    if (command.frequencia) habito.updateFrequencia(command.frequencia);
    if (command.diasSemana !== undefined)
      habito.updateDiasSemana(command.diasSemana);
    if (command.metaVezes !== undefined)
      habito.updateMetaVezes(command.metaVezes);

    await this.habitoRepository.update(habito);

    const streak = await this.habitoRepository.getStreak(habito.id);
    const completoHoje = await this.habitoRepository.isCompletoHoje(habito.id);

    return {
      id: habito.id,
      blocoId: habito.blocoId,
      nome: habito.nome,
      frequencia: habito.frequencia,
      diasSemana: habito.diasSemana,
      metaVezes: habito.metaVezes,
      streakAtual: streak.atual,
      streakMaximo: streak.maximo,
      completoHoje,
      createdAt: habito.createdAt.toISOString(),
      updatedAt: habito.updatedAt.toISOString(),
    };
  }
}
