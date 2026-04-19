import { IListaRepository } from "../../../domain/repositories/IListaRepository";
import { DeleteListaCommand } from "./DeleteListaCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class DeleteListaHandler {
  constructor(private readonly listaRepository: IListaRepository) {} //  Apenas 1 parâmetro

  async execute(command: DeleteListaCommand): Promise<void> {
    const { id, userId } = command;

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
      throw new ForbiddenException("Sem permissão para deletar esta lista");
    }

    await this.listaRepository.deleteLista(id);
  }
}
