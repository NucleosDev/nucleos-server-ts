import { IBlocoRepository } from "../../../domain/repositories/IBlocoRepository";
import { GetBlocoByIdQuery } from "./GetBlocoByIdQuery";
import { BlocoResponseDto } from "../../dto/bloco.dto";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";

export class GetBlocoByIdHandler {
  constructor(private readonly blocoRepository: IBlocoRepository) {}

  async execute(query: GetBlocoByIdQuery): Promise<BlocoResponseDto> {
    const { id, userId, nucleoId } = query;

    const nucleoCheck = await pool.query(
      `SELECT id FROM nucleos WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [nucleoId, userId],
    );

    if (nucleoCheck.rows.length === 0) {
      throw new NotFoundException("Núcleo", nucleoId);
    }

    const bloco = await this.blocoRepository.findById(id, nucleoId);
    if (!bloco) {
      throw new NotFoundException("Bloco", id);
    }

    return {
      id: bloco.id,
      nucleoId: bloco.nucleoId,
      tipo: bloco.tipo,
      titulo: bloco.titulo,
      posicao: bloco.posicao,
      configuracoes: bloco.configuracoes,
      createdAt: bloco.createdAt.toISOString(),
      updatedAt: bloco.updatedAt.toISOString(),
      deletedAt: bloco.deletedAt?.toISOString() || null,
    };
  }
}
