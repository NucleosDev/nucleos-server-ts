import { IBlocoRepository } from "../../../domain/repositories/IBlocoRepository";
import { GetBlocosByNucleoQuery } from "./GetBlocosByNucleoQuery";
import { BlocoResponseDto } from "../../dto/bloco.dto";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class GetBlocosByNucleoHandler {
  constructor(private readonly blocoRepository: IBlocoRepository) {}

  async execute(query: GetBlocosByNucleoQuery): Promise<BlocoResponseDto[]> {
    const { nucleoId, userId } = query;

    const nucleoCheck = await pool.query(
      `SELECT id FROM nucleos WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [nucleoId, userId],
    );

    if (nucleoCheck.rows.length === 0) {
      throw new Error("Núcleo não encontrado ou sem permissão");
    }

    const blocos = await this.blocoRepository.findByNucleoId(nucleoId);

    return blocos.map((bloco) => ({
      id: bloco.id,
      nucleoId: bloco.nucleoId,
      tipo: bloco.tipo,
      titulo: bloco.titulo,
      posicao: bloco.posicao,
      configuracoes: bloco.configuracoes,
      createdAt: bloco.createdAt.toISOString(),
      updatedAt: bloco.updatedAt.toISOString(),
      deletedAt: bloco.deletedAt?.toISOString() || null,
    }));
  }
}
