import { IListaRepository } from "../../../domain/repositories/IListaRepository";
import { UpdateItemListaCommand } from "./UpdateItemListaCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class UpdateItemListaHandler {
  constructor(private readonly listaRepository: IListaRepository) {}

  async execute(command: UpdateItemListaCommand): Promise<any> {
    const { id, userId, nome, quantidade, valorUnitario, categoriaId } =
      command;

    // Verificar permissão
    const check = await pool.query(
      `SELECT n.user_id FROM itens_lista i
       JOIN listas l ON l.id = i.lista_id
       JOIN blocos b ON b.id = l.bloco_id
       JOIN nucleos n ON n.id = b.nucleo_id
       WHERE i.id = $1 AND i.deleted_at IS NULL`,
      [id],
    );

    if (check.rows.length === 0) {
      throw new NotFoundException("Item", id);
    }

    if (check.rows[0].user_id !== userId) {
      throw new ForbiddenException("Sem permissão para editar este item");
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (nome !== undefined) {
      updates.push(`nome = $${paramIndex++}`);
      values.push(nome);
    }

    if (quantidade !== undefined) {
      updates.push(`quantidade = $${paramIndex++}`);
      values.push(quantidade);
    }

    if (valorUnitario !== undefined) {
      updates.push(`valor_unitario = $${paramIndex++}`);
      values.push(valorUnitario);
    }

    if (categoriaId !== undefined) {
      updates.push(`categoria_id = $${paramIndex++}`);
      values.push(categoriaId || null);
    }

    if (updates.length === 0) {
      throw new Error("Nenhum campo para atualizar");
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    // Executar UPDATE
    await pool.query(
      `UPDATE itens_lista SET ${updates.join(", ")} WHERE id = $${paramIndex}`,
      values,
    );

    // Buscar item atualizado
    const result = await pool.query(`SELECT * FROM itens_lista WHERE id = $1`, [
      id,
    ]);

    return {
      id: result.rows[0].id,
      listaId: result.rows[0].lista_id,
      categoriaId: result.rows[0].categoria_id,
      nome: result.rows[0].nome,
      quantidade: parseFloat(result.rows[0].quantidade),
      valorUnitario: result.rows[0].valor_unitario
        ? parseFloat(result.rows[0].valor_unitario)
        : null,
      valorTotal: result.rows[0].valor_total
        ? parseFloat(result.rows[0].valor_total)
        : null,
      checked: result.rows[0].checked,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at,
    };
  }
}
