// application/queries/habitos/GetHabitosByBlocoHandler.ts

import { IHabitoRepository } from "../../../domain/repositories/IHabitoRepository";
import { HabitoResponseDto } from "../../dto/habito.dto";
import { GetHabitosByBlocoQuery } from "./GetHabitosByBlocoQuery";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class GetHabitosByBlocoHandler {
  constructor(private readonly habitoRepository: IHabitoRepository) {}

  async execute(query: GetHabitosByBlocoQuery): Promise<HabitoResponseDto[]> {
    console.log("📥 [GetHabitosByBlocoHandler]", {
      blocoId: query.blocoId,
      userId: query.userId,
    });

    try {
      // ✅ Removido b.deleted_at da query
      const blocoCheck = await pool.query(
        `SELECT b.id, b.tipo, n.user_id 
         FROM blocos b
         JOIN nucleos n ON b.nucleo_id = n.id
         WHERE b.id = $1`,
        [query.blocoId],
      );

      console.log("🔍 [BlocoCheck]", {
        found: blocoCheck.rows.length > 0,
        tipo: blocoCheck.rows[0]?.tipo,
        userId: blocoCheck.rows[0]?.user_id,
      });

      if (blocoCheck.rows.length === 0) {
        console.log("⚠️ Bloco não encontrado, retornando []");
        return [];
      }

      const bloco = blocoCheck.rows[0];

      if (bloco.user_id !== query.userId) {
        console.log("⚠️ Acesso negado, retornando []");
        return [];
      }

      if (bloco.tipo !== "habitos" && bloco.tipo !== "habito") {
        console.log("⚠️ Bloco não é de hábitos, retornando []");
        return [];
      }

      const habitos = await this.habitoRepository.findAllByBlocoId(
        query.blocoId,
      );
      console.log("✅ Hábitos encontrados:", habitos.length);

      const result: HabitoResponseDto[] = [];

      for (const habito of habitos) {
        try {
          const streak = await this.habitoRepository.getStreak(habito.id);
          const completoHoje = await this.habitoRepository.isCompletoHoje(
            habito.id,
          );

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
            createdAt:
              habito.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt:
              habito.updatedAt?.toISOString() || new Date().toISOString(),
          });
        } catch (err: any) {
          console.error("❌ Erro ao processar hábito:", habito.id, err.message);
        }
      }

      return result;
    } catch (error: any) {
      console.error("❌ [GetHabitosByBlocoHandler] Erro:", error.message);
      return [];
    }
  }
}
