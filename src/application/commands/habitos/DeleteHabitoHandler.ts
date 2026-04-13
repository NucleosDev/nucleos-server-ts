import { IHabitoRepository } from "../../../domain/repositories/IHabitoRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { DeleteHabitoCommand } from "./DeleteHabitoCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class DeleteHabitoHandler {
  constructor(
    private readonly habitoRepository: IHabitoRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(command: DeleteHabitoCommand): Promise<void> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar permissão
    const habitoCheck = await pool.query(
      `SELECT h.id, n.user_id
       FROM habitos h
       JOIN blocos b ON h.bloco_id = b.id
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE h.id = $1`,
      [command.id],
    );

    if (habitoCheck.rows.length === 0) {
      throw new Error("Hábito não encontrado");
    }

    if (habitoCheck.rows[0].user_id !== userId) {
      throw new Error("Acesso negado");
    }

    await this.habitoRepository.delete(command.id);
  }
}
