import { ICalendarioRepository } from "../../../domain/repositories/ICalendarioRepository";
import { EventoResponseDto } from "../../dto/calendario.dto";
import { GetEventosByNucleoQuery } from "./GetEventosByNucleoQuery";

export class GetEventosByNucleoHandler {
  constructor(private readonly calendarioRepository: ICalendarioRepository) {}

  async execute(query: GetEventosByNucleoQuery): Promise<EventoResponseDto[]> {
    let eventos;

    if (query.startDate && query.endDate) {
      eventos = await this.calendarioRepository.findAllByDateRange(
        query.nucleoId,
        query.startDate,
        query.endDate,
      );
    } else {
      eventos = await this.calendarioRepository.findAllByNucleoId(
        query.nucleoId,
      );
    }

    return eventos.map((evento) => ({
      id: evento.id,
      nucleoId: evento.nucleoId,
      titulo: evento.titulo,
      descricao: evento.descricao,
      dataEvento: evento.dataEvento.toISOString(),
      duracaoMinutos: evento.duracaoMinutos,
      dataFim: evento.dataFim?.toISOString() || null,
      createdAt: evento.createdAt.toISOString(),
      updatedAt: evento.updatedAt.toISOString(),
    }));
  }
}
