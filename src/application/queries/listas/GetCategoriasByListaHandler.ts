import { IListaRepository } from "../../../domain/repositories/IListaRepository";
import { GetCategoriasByListaQuery } from "./GetCategoriasByListaQuery";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class GetCategoriasByListaHandler {
  constructor(private readonly listaRepository: IListaRepository) {}

  async execute(query: GetCategoriasByListaQuery): Promise<any[]> {
    const { listaId, userId } = query;

    // Verificar permissão
    const check = await pool.query(
      `SELECT n.user_id FROM listas l
       JOIN blocos b ON b.id = l.bloco_id
       JOIN nucleos n ON n.id = b.nucleo_id
       WHERE l.id = $1 AND l.deleted_at IS NULL`,
      [listaId],
    );

    if (check.rows.length === 0) {
      throw new NotFoundException("Lista", listaId);
    }

    if (check.rows[0].user_id !== userId) {
      throw new ForbiddenException(
        "Sem permissão para ver categorias desta lista",
      );
    }

    const result = await pool.query(
      `SELECT id, lista_id, nome, cor, created_at
       FROM categorias
       WHERE lista_id = $1
       ORDER BY nome ASC`,
      [listaId],
    );

    return result.rows.map((row) => ({
      id: row.id,
      listaId: row.lista_id,
      nome: row.nome,
      cor: row.cor,
      createdAt: row.created_at,
    }));
  }
}
