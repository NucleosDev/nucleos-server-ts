// src/application/queries/listas/GetListaByIdHandler.ts
import { GetListaByIdQuery } from "./GetListaByIdQuery";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class GetListaByIdHandler {
  async execute(query: GetListaByIdQuery): Promise<any> {
    const { id, userId } = query;

    // 1. Buscar a lista e verificar permissão (bloco → nucleo)
    const listaResult = await pool.query(
      `SELECT 
         l.id, l.bloco_id, l.nome, l.tipo_lista, 
         l.created_at, l.updated_at,
         b.nucleo_id,
         n.user_id
       FROM listas l
       JOIN blocos b ON b.id = l.bloco_id
       JOIN nucleos n ON n.id = b.nucleo_id
       WHERE l.id = $1 AND l.deleted_at IS NULL`,
      [id],
    );

    if (listaResult.rows.length === 0) {
      throw new NotFoundException("Lista", id);
    }

    const listaRow = listaResult.rows[0];

    if (listaRow.user_id !== userId) {
      throw new ForbiddenException("Sem permissão para acessar esta lista");
    }

    // 2. Buscar itens da lista
    const itensResult = await pool.query(
      `SELECT 
         id, lista_id, categoria_id, nome, quantidade, 
         valor_unitario, valor_total, checked, 
         created_at, updated_at
       FROM itens_lista
       WHERE lista_id = $1 AND deleted_at IS NULL
       ORDER BY created_at ASC`,
      [id],
    );

    const itens = itensResult.rows.map((row) => ({
      id: row.id,
      listaId: row.lista_id,
      categoriaId: row.categoria_id,
      nome: row.nome,
      quantidade: parseFloat(row.quantidade),
      valorUnitario: parseFloat(row.valor_unitario),
      valorTotal: parseFloat(row.valor_total),
      checked: row.checked,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    // 3. Buscar categorias da lista
    const categoriasResult = await pool.query(
      `SELECT id, lista_id, nome, cor, created_at
       FROM categorias
       WHERE lista_id = $1
       ORDER BY nome ASC`,
      [id],
    );

    const categorias = categoriasResult.rows.map((row) => ({
      id: row.id,
      listaId: row.lista_id,
      nome: row.nome,
      cor: row.cor,
      createdAt: row.created_at,
    }));

    // 4. Retornar objeto completo
    return {
      id: listaRow.id,
      blocoId: listaRow.bloco_id,
      nome: listaRow.nome,
      tipoLista: listaRow.tipo_lista,
      createdAt: listaRow.created_at,
      updatedAt: listaRow.updated_at,
      itens,
      categorias,
    };
  }
}
