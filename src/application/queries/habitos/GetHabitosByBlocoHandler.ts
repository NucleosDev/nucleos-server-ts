import { IHabitoRepository } from "../../../domain/repositories/IHabitoRepository";
import { HabitoResponseDto } from "../../dto/habito.dto";
import { GetHabitosByBlocoQuery } from "./GetHabitosByBlocoQuery";
import { pool } from "../../../infrastructure/persistence/db/connection";
import {
  getCache,
  setCache,
  CacheKeys,
  TTL,
} from "../../../infrastructure/cache/redis.service";

export class GetHabitosByBlocoHandler {
  constructor(private readonly habitoRepository: IHabitoRepository) {}

  async execute(query: GetHabitosByBlocoQuery): Promise<HabitoResponseDto[]> {
    const cacheKey = CacheKeys.habitosByBloco(query.blocoId);
    const cached = await getCache<HabitoResponseDto[]>(cacheKey);
    if (cached) return cached;

    try {
      const blocoCheck = await pool.query(
        `SELECT b.id, b.tipo, n.user_id
         FROM blocos b
         JOIN nucleos n ON b.nucleo_id = n.id
         WHERE b.id = $1`,
        [query.blocoId],
      );

      if (blocoCheck.rows.length === 0) return [];

      const bloco = blocoCheck.rows[0];
      if (bloco.user_id !== query.userId) return [];
      if (bloco.tipo !== "habitos" && bloco.tipo !== "habito") return [];

      const habitos = await this.habitoRepository.findAllByBlocoId(query.blocoId);
      const result: HabitoResponseDto[] = [];

      for (const habito of habitos) {
        try {
          const streak = await this.habitoRepository.getStreak(habito.id);
          const completoHoje = await this.habitoRepository.isCompletoHoje(habito.id);

          result.push({
            id: habito.id,
            blocoId: habito.blocoId,
            nome: habito.nome,
            frequencia: habito.frequencia,
            diasSemana: habito.diasSemana || [],
            metaVezes: habito.metaVezes || 1,
            streakAtual: streak?.atual || 0,
            streakMaximo: streak?.maximo || 0,
            completoHoje: completoHoje || false,
            createdAt: habito.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: habito.updatedAt?.toISOString() || new Date().toISOString(),
          });
        } catch {}
      }

      await setCache(cacheKey, result, TTL.SHORT);
      return result;
    } catch {
      return [];
    }
  }
}
