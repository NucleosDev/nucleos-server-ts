import { IColecaoRepository } from "../../../domain/repositories/IColecaoRepository";
import { DeleteCampoCommand } from "./DeleteCampoCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class DeleteCampoHandler {
  constructor(private readonly colecaoRepository: IColecaoRepository) {}

  async execute(command: DeleteCampoCommand): Promise<void> {
    const { id, userId } = command;

    const check = await pool.query(
      `SELECT n.user_id FROM campos c
       JOIN colecoes co ON co.id = c.colecao_id
       JOIN blocos b ON b.id = co.bloco_id
       JOIN nucleos n ON n.id = b.nucleo_id
       WHERE c.id = $1`,
      [id],
    );

    if (check.rows.length === 0) {
      throw new NotFoundException("Campo", id);
    }

    if (check.rows[0].user_id !== userId) {
      throw new ForbiddenException("Sem permissão para deletar este campo");
    }

    await pool.query(`DELETE FROM campos WHERE id = $1`, [id]);
  }
}
