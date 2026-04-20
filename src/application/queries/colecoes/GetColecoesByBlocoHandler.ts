import { IColecaoRepository } from "../../../domain/repositories/IColecaoRepository";
import { ColecaoResponseDto } from "../../dto/colecao.dto";
import { GetColecoesByBlocoQuery } from "./GetColecoesByBlocoQuery";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class GetColecoesByBlocoHandler {
  constructor(private readonly colecaoRepository: IColecaoRepository) {}

  async execute(query: GetColecoesByBlocoQuery): Promise<ColecaoResponseDto[]> {
    const { userId, blocoId } = query;

    console.log(
      `📥 [GetColecoesByBloco] userId: ${userId} blocoId: ${blocoId}`,
    );

    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const blocoCheck = await pool.query(
      `SELECT n.user_id FROM blocos b
       JOIN nucleos n ON n.id = b.nucleo_id
       WHERE b.id = $1 AND b.deleted_at IS NULL`,
      [blocoId],
    );

    if (blocoCheck.rows.length === 0) {
      throw new NotFoundException("Bloco", blocoId);
    }

    if (blocoCheck.rows[0].user_id !== userId) {
      throw new ForbiddenException(
        "Sem permissão para ver coleções deste bloco",
      );
    }

    const colecoes =
      await this.colecaoRepository.findAllColecoesByBlocoId(blocoId);

    return colecoes.map((colecao) => ({
      id: colecao.id,
      blocoId: colecao.blocoId,
      nome: colecao.nome,
      createdAt: colecao.createdAt.toISOString(),
      updatedAt: colecao.updatedAt.toISOString(),
    }));
  }
}
