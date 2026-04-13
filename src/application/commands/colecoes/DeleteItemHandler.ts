import { IColecaoRepository } from "../../../domain/repositories/IColecaoRepository";
import { DeleteItemCommand } from "./DeleteItemCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class DeleteItemHandler {
  constructor(private readonly colecaoRepository: IColecaoRepository) {}

  async execute(command: DeleteItemCommand): Promise<void> {
    const { id, userId } = command;

    const check = await pool.query(
      `SELECT n.user_id FROM itens i
       JOIN colecoes c ON i.colecao_id = c.id
       JOIN blocos b ON b.id = c.bloco_id
       JOIN nucleos n ON n.id = b.nucleo_id
       WHERE i.id = $1`,
      [id],
    );

    if (check.rows.length === 0) {
      throw new NotFoundException("Item", id);
    }

    if (check.rows[0].user_id !== userId) {
      throw new ForbiddenException("Sem permissão para deletar este item");
    }

    await pool.query(`DELETE FROM item_valores WHERE item_id = $1`, [id]);
    await pool.query(`DELETE FROM itens WHERE id = $1`, [id]);
  }
}
