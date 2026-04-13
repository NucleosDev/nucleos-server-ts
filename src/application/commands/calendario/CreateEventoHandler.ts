import { CalendarioEvento } from "../../../domain/entities/CalendarioEvento";
import { ICalendarioRepository } from "../../../domain/repositories/ICalendarioRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { CreateEventoCommand } from "./CreateEventoCommand";
import { EventoResponseDto } from "../../dto/calendario.dto";

export class CreateEventoHandler {
  constructor(
    private readonly calendarioRepository: ICalendarioRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(command: CreateEventoCommand): Promise<EventoResponseDto> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar se o núcleo pertence ao usuário
    const nucleoCheck = await pool.query(
      `SELECT id FROM nucleos WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [command.nucleoId, userId],
    );

    if (nucleoCheck.rows.length === 0) {
      throw new Error("Núcleo não encontrado");
    }

    const evento = CalendarioEvento.create({
      nucleoId: command.nucleoId,
      titulo: command.titulo,
      descricao: command.descricao,
      dataEvento: command.dataEvento,
      duracaoMinutos: command.duracaoMinutos,
    });

    await this.calendarioRepository.save(evento);

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
