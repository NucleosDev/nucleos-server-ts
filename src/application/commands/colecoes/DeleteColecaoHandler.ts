import { IColecaoRepository } from "../../../domain/repositories/IColecaoRepository";
import { DeleteColecaoCommand } from "./DeleteColecaoCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class DeleteColecaoHandler {
  constructor(private readonly colecaoRepository: IColecaoRepository) {}

  async execute(command: DeleteColecaoCommand): Promise<void> {
    const { id, userId } = command;

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
      throw new ForbiddenException("Sem permissão para deletar esta coleção");
    }

    await pool.query(`DELETE FROM colecoes WHERE id = $1`, [id]);
  }
}
