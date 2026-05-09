import { IHabitoRepository } from "../../../domain/repositories/IHabitoRepository";
import { DeleteHabitoCommand } from "./DeleteHabitoCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";
import {
  deleteCache,
  CacheKeys,
} from "../../../infrastructure/cache/redis.service";

export class DeleteHabitoHandler {
  constructor(private readonly habitoRepository: IHabitoRepository) {}

  async execute(command: DeleteHabitoCommand): Promise<void> {
    const habitoCheck = await pool.query(
      `SELECT h.bloco_id, n.user_id
       FROM habitos h
       JOIN blocos b ON h.bloco_id = b.id
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE h.id = $1`,
      [command.id],
    );

    if (habitoCheck.rows.length === 0) throw new Error("Hábito não encontrado");
    if (habitoCheck.rows[0].user_id !== command.userId) throw new Error("Acesso negado");

    const blocoId: string = habitoCheck.rows[0].bloco_id;

    await this.habitoRepository.delete(command.id);
    await deleteCache(CacheKeys.habitosByBloco(blocoId));
  }
}
