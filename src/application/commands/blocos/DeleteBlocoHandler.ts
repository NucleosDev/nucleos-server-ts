import { IBlocoRepository } from "../../../domain/repositories/IBlocoRepository";
import { DeleteBlocoCommand } from "./DeleteBlocoCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class DeleteBlocoHandler {
  constructor(private readonly blocoRepository: IBlocoRepository) {}

  async execute(command: DeleteBlocoCommand): Promise<void> {
    const { id, userId } = command;

    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar permissão
    const nucleoCheck = await pool.query(
      `SELECT n.user_id, n.id FROM nucleos n
       INNER JOIN blocos b ON b.nucleo_id = n.id
       WHERE b.id = $1 AND n.deleted_at IS NULL AND b.deleted_at IS NULL`,
      [id],
    );

    if (nucleoCheck.rows.length === 0) {
      throw new NotFoundException("Bloco", id);
    }

    if (nucleoCheck.rows[0].user_id !== userId) {
      throw new ForbiddenException(
        "Você não tem permissão para deletar este bloco",
      );
    }

    await this.blocoRepository.delete(id);
  }
}
