import { IHabitoRepository } from "../../../domain/repositories/IHabitoRepository";
import { DeleteHabitoCommand } from "./DeleteHabitoCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class DeleteHabitoHandler {
  constructor(private readonly habitoRepository: IHabitoRepository) {}

  async execute(command: DeleteHabitoCommand): Promise<void> {
    const habitoCheck = await pool.query(
      `SELECT h.id, n.user_id
       FROM habitos h
       JOIN blocos b ON h.bloco_id = b.id
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE h.id = $1 AND h.deleted_at IS NULL`,
      [command.id],
    );

    if (habitoCheck.rows.length === 0) {
      throw new Error("Hábito não encontrado");
    }

    if (habitoCheck.rows[0].user_id !== command.userId) {
      throw new Error("Acesso negado");
    }

    await this.habitoRepository.delete(command.id);
  }
}
