import { IColecaoRepository } from "../../../domain/repositories/IColecaoRepository";
import { CampoResponseDto } from "../../dto/colecao.dto";
import { GetCamposByColecaoQuery } from "./GetCamposByColecaoQuery";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class GetCamposByColecaoHandler {
  constructor(private readonly colecaoRepository: IColecaoRepository) {}

  async execute(query: GetCamposByColecaoQuery): Promise<CampoResponseDto[]> {
    const { colecaoId, userId } = query;

    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar permissão
    const check = await pool.query(
      `SELECT n.user_id FROM colecoes c
       JOIN blocos b ON b.id = c.bloco_id
       JOIN nucleos n ON n.id = b.nucleo_id
       WHERE c.id = $1`,
      [colecaoId],
    );

    if (check.rows.length === 0) {
      throw new NotFoundException("Coleção", colecaoId);
    }

    if (check.rows[0].user_id !== userId) {
      throw new ForbiddenException(
        "Sem permissão para ver campos desta coleção",
      );
    }

    const campos =
      await this.colecaoRepository.findAllCamposByColecaoId(colecaoId);

    return campos.map((campo) => ({
      id: campo.id,
      colecaoId: campo.colecaoId,
      nome: campo.nome,
      tipoCampo: campo.tipoCampo,
      createdAt: campo.createdAt.toISOString(),
      updatedAt: campo.updatedAt.toISOString(),
    }));
  }
}
