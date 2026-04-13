import { IBlocoRepository } from "../../../domain/repositories/IBlocoRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { DeleteBlocoCommand } from "./DeleteBlocoCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class DeleteBlocoHandler {
  constructor(
    private readonly blocoRepository: IBlocoRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(command: DeleteBlocoCommand): Promise<void> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar permissão
    const nucleoCheck = await pool.query(
      `SELECT n.id FROM nucleos n
       INNER JOIN blocos b ON b.nucleo_id = n.id
       WHERE b.id = $1 AND n.user_id = $2 AND n.deleted_at IS NULL AND b.deleted_at IS NULL`,
      [command.id, userId],
    );

    if (nucleoCheck.rows.length === 0) {
      throw new Error("Bloco não encontrado ou sem permissão");
    }

    await this.blocoRepository.delete(command.id, command.nucleoId);
  }
}
