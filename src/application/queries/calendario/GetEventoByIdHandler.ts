import { ICalendarioRepository } from "../../../domain/repositories/ICalendarioRepository";
import { EventoResponseDto } from "../../dto/calendario.dto";
import { GetEventoByIdQuery } from "./GetEventoByIdQuery";

export class GetEventoByIdHandler {
  constructor(private readonly calendarioRepository: ICalendarioRepository) {}

  async execute(query: GetEventoByIdQuery): Promise<EventoResponseDto> {
    const evento = await this.calendarioRepository.findById(query.id);
    if (!evento) {
      throw new Error("Evento não encontrado");
    }

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
