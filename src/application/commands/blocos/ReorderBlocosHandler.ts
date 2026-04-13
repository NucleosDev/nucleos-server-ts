import { IBlocoRepository } from "../../../domain/repositories/IBlocoRepository";
import { ReorderBlocosCommand } from "./ReorderBlocosCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class ReorderBlocosHandler {
  constructor(private readonly blocoRepository: IBlocoRepository) {}

  async execute(command: ReorderBlocosCommand): Promise<void> {
    const { nucleoId, userId, orders } = command;

    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const nucleoCheck = await pool.query(
      `SELECT id FROM nucleos WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [nucleoId, userId],
    );

    if (nucleoCheck.rows.length === 0) {
      throw new Error("Núcleo não encontrado ou sem permissão");
    }

    for (const order of orders) {
      await this.blocoRepository.updatePosition(
        order.id,
        order.posicao,
        nucleoId,
      );
    }
  }
}
