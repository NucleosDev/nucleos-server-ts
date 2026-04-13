// application/commands/listas/UpdateListaHandler.ts
import { IListaRepository } from "../../../domain/repositories/IListaRepository";
import { UpdateListaCommand } from "./UpdateListaCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class UpdateListaHandler {
  constructor(private readonly listaRepository: IListaRepository) {}

  async execute(command: UpdateListaCommand): Promise<any> {
    const { id, userId, nome, tipoLista } = command;

    // Verificar permissão
    const check = await pool.query(
      `SELECT n.user_id FROM listas l
       JOIN blocos b ON b.id = l.bloco_id
       JOIN nucleos n ON n.id = b.nucleo_id
       WHERE l.id = $1 AND l.deleted_at IS NULL`,
      [id],
    );

    if (check.rows.length === 0) {
      throw new NotFoundException("Lista", id);
    }

    if (check.rows[0].user_id !== userId) {
      throw new ForbiddenException("Sem permissão para editar esta lista");
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (nome !== undefined) {
      updates.push(`nome = $${paramIndex++}`);
      values.push(nome);
    }
    if (tipoLista !== undefined) {
      updates.push(`tipo_lista = $${paramIndex++}`);
      values.push(tipoLista);
    }

    if (updates.length === 0) {
      throw new Error("Nenhum campo para atualizar");
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    await pool.query(
      `UPDATE listas SET ${updates.join(", ")} WHERE id = $${paramIndex}`,
      values,
    );

    const result = await pool.query(`SELECT * FROM listas WHERE id = $1`, [id]);

    return {
      id: result.rows[0].id,
      blocoId: result.rows[0].bloco_id,
      nome: result.rows[0].nome,
      tipoLista: result.rows[0].tipo_lista,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at,
    };
  }
}
