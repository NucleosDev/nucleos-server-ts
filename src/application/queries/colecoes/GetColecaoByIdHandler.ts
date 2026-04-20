import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";
import { GetColecaoByIdQuery } from "./GetColecaoByIdQuery";
import { Colecao } from "../../../domain/entities/Colecao";
import { Campo } from "../../../domain/entities/Campo";

export class GetColecaoByIdHandler {
  async execute(query: GetColecaoByIdQuery): Promise<any> {
    const { userId, colecaoId } = query;

    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const permissaoQuery = await pool.query(
      `SELECT c.id, c.bloco_id, c.nome, c.created_at, c.updated_at,
              n.user_id AS owner_id
       FROM colecoes c
       JOIN blocos b ON b.id = c.bloco_id
       JOIN nucleos n ON n.id = b.nucleo_id
       WHERE c.id = $1`,
      [colecaoId],
    );

    if (permissaoQuery.rows.length === 0) {
      throw new NotFoundException("Coleção", colecaoId);
    }

    const row = permissaoQuery.rows[0];

    if (row.owner_id !== userId) {
      throw new ForbiddenException("Sem permissão para acessar esta coleção");
    }

    const colecao = Colecao.reconstitute({
      id: row.id,
      blocoId: row.bloco_id,
      nome: row.nome,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });

    const camposQuery = await pool.query(
      `SELECT id, colecao_id, nome, tipo_campo, created_at, updated_at
       FROM campos
       WHERE colecao_id = $1
       ORDER BY created_at ASC`,
      [colecaoId],
    );

    const campos = camposQuery.rows.map((c) =>
      Campo.reconstitute({
        id: c.id,
        colecaoId: c.colecao_id,
        nome: c.nome,
        tipoCampo: c.tipo_campo,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }),
    );

    return {
      ...colecao.toJSON(),
      campos: campos.map((c) => c.toJSON()),
    };
  }
}
