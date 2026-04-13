import { IListaRepository } from "../../../domain/repositories/IListaRepository";
import { DeleteItemListaCommand } from "./DeleteItemListaCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class DeleteItemListaHandler {
  constructor(private readonly listaRepository: IListaRepository) {}

  async execute(command: DeleteItemListaCommand): Promise<void> {
    const { id, userId } = command;

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
      throw new ForbiddenException("Sem permissão para deletar este item");
    }

    await pool.query(
      `UPDATE itens_lista SET deleted_at = NOW() WHERE id = $1`,
      [id],
    );
  }
}
