import { IHabitoRepository } from "../../../domain/repositories/IHabitoRepository";
import { HabitoResponseDto } from "../../dto/habito.dto";
import { GetHabitosByBlocoQuery } from "./GetHabitosByBlocoQuery";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class GetHabitosByBlocoHandler {
  constructor(private readonly habitoRepository: IHabitoRepository) {}

  async execute(query: GetHabitosByBlocoQuery): Promise<HabitoResponseDto[]> {
    const blocoCheck = await pool.query(
      `SELECT n.user_id 
       FROM blocos b
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE b.id = $1 AND b.deleted_at IS NULL`,
      [query.blocoId],
    );

    if (blocoCheck.rows.length === 0) {
      throw new Error("Bloco não encontrado");
    }

    if (blocoCheck.rows[0].user_id !== query.userId) {
      throw new Error("Acesso negado");
    }

    const habitos = await this.habitoRepository.findAllByBlocoId(query.blocoId);

    const result: HabitoResponseDto[] = [];

    for (const habito of habitos) {
      const streak = await this.habitoRepository.getStreak(habito.id);
      const completoHoje = await this.habitoRepository.isCompletoHoje(
        habito.id,
      );

      result.push({
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
      });
    }

    return result;
  }
}
