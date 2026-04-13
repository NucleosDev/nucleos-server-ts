import { IBlocoRepository } from "../../../domain/repositories/IBlocoRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { ReorderBlocosCommand } from "./ReorderBlocosCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class ReorderBlocosHandler {
  constructor(
    private readonly blocoRepository: IBlocoRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(command: ReorderBlocosCommand): Promise<void> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar permissão
    const nucleoCheck = await pool.query(
      `SELECT id FROM nucleos WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [command.nucleoId, userId],
    );

    if (nucleoCheck.rows.length === 0) {
      throw new Error("Núcleo não encontrado ou sem permissão");
    }

    await this.blocoRepository.reorder(command.nucleoId, command.orders);
  }
}
