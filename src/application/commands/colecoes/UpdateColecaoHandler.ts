import { IColecaoRepository } from "../../../domain/repositories/IColecaoRepository";
import { UpdateColecaoCommand } from "./UpdateColecaoCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class UpdateColecaoHandler {
  constructor(private readonly colecaoRepository: IColecaoRepository) {}

  async execute(command: UpdateColecaoCommand): Promise<any> {
    const { id, userId, nome } = command;

    // Verificar permissão
    const check = await pool.query(
      `SELECT n.user_id FROM colecoes c
       JOIN blocos b ON b.id = c.bloco_id
       JOIN nucleos n ON n.id = b.nucleo_id
       WHERE c.id = $1`,
      [id],
    );

    if (check.rows.length === 0) {
      throw new NotFoundException("Coleção", id);
    }

    if (check.rows[0].user_id !== userId) {
      throw new ForbiddenException("Sem permissão para editar esta coleção");
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (nome !== undefined) {
      updates.push(`nome = $${paramIndex++}`);
      values.push(nome);
    }

    if (updates.length === 0) {
      throw new Error("Nenhum campo para atualizar");
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    await pool.query(
      `UPDATE colecoes SET ${updates.join(", ")} WHERE id = $${paramIndex}`,
      values,
    );

    const result = await pool.query(`SELECT * FROM colecoes WHERE id = $1`, [
      id,
    ]);

    return {
      id: result.rows[0].id,
      blocoId: result.rows[0].bloco_id,
      nome: result.rows[0].nome,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at,
    };
  }
}
