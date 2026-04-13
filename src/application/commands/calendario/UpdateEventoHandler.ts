import { ICalendarioRepository } from "../../../domain/repositories/ICalendarioRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { UpdateEventoCommand } from "./UpdateEventoCommand";
import { EventoResponseDto } from "../../dto/calendario.dto";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class UpdateEventoHandler {
  constructor(
    private readonly calendarioRepository: ICalendarioRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(command: UpdateEventoCommand): Promise<EventoResponseDto> {
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

    if (command.titulo !== undefined) evento.updateTitulo(command.titulo);
    if (command.descricao !== undefined)
      evento.updateDescricao(command.descricao);
    if (command.dataEvento !== undefined)
      evento.updateDataEvento(command.dataEvento);
    if (command.duracaoMinutos !== undefined)
      evento.updateDuracao(command.duracaoMinutos);

    await this.calendarioRepository.update(evento);

    return {
      id: evento.id,
      nucleoId: evento.nucleoId,
      titulo: evento.titulo,
      descricao: evento.descricao,
      dataEvento: evento.dataEvento.toISOString(),
      duracaoMinutos: evento.duracaoMinutos,
      dataFim: evento.dataFim?.toISOString() || null,
      createdAt: evento.createdAt.toISOString(),
      updatedAt: evento.updatedAt.toISOString(),
    };
  }
}
