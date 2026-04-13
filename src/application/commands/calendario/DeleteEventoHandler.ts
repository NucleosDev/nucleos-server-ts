import { ICalendarioRepository } from "../../../domain/repositories/ICalendarioRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { DeleteEventoCommand } from "./DeleteEventoCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class DeleteEventoHandler {
  constructor(
    private readonly calendarioRepository: ICalendarioRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(command: DeleteEventoCommand): Promise<void> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const evento = await this.calendarioRepository.findById(command.id);
    if (!evento) {
      throw new Error("Evento não encontrado");
    }

    // Verificar permissão via núcleo
    const nucleoCheck = await pool.query(
      `SELECT user_id FROM nucleos WHERE id = $1 AND deleted_at IS NULL`,
      [evento.nucleoId],
    );

    if (nucleoCheck.rows[0]?.user_id !== userId) {
      throw new Error("Acesso negado");
    }

    await this.calendarioRepository.delete(command.id);
  }
}
