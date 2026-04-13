import { IHabitoRepository } from "../../../domain/repositories/IHabitoRepository";
import { HabitoResponseDto } from "../../dto/habito.dto";
import { GetHabitosByBlocoQuery } from "./GetHabitosByBlocoQuery";

export class GetHabitosByBlocoHandler {
  constructor(private readonly habitoRepository: IHabitoRepository) {}

  async execute(query: GetHabitosByBlocoQuery): Promise<HabitoResponseDto[]> {
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
