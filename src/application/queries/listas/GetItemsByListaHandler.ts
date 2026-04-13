import { IListaRepository } from "../../../domain/repositories/IListaRepository";
import { GetItemsByListaQuery } from "./GetItemsByListaQuery";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class GetItemsByListaHandler {
  constructor(private readonly listaRepository: IListaRepository) {}

  async execute(query: GetItemsByListaQuery): Promise<any[]> {
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
      throw new ForbiddenException("Sem permissão para ver itens desta lista");
    }

    const result = await pool.query(
      `SELECT i.id, i.lista_id, i.categoria_id, i.nome, i.quantidade, 
              i.valor_unitario, i.valor_total, i.checked, i.created_at, i.updated_at,
              c.nome as categoria_nome, c.cor as categoria_cor
       FROM itens_lista i
       LEFT JOIN categorias c ON c.id = i.categoria_id
       WHERE i.lista_id = $1 AND i.deleted_at IS NULL
       ORDER BY i.created_at ASC`,
      [listaId],
    );

    return result.rows.map((row) => ({
      id: row.id,
      listaId: row.lista_id,
      categoriaId: row.categoria_id,
      categoriaNome: row.categoria_nome,
      categoriaCor: row.categoria_cor,
      nome: row.nome,
      quantidade: parseFloat(row.quantidade),
      valorUnitario: row.valor_unitario ? parseFloat(row.valor_unitario) : null,
      valorTotal: row.valor_total ? parseFloat(row.valor_total) : null,
      checked: row.checked,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }
}
