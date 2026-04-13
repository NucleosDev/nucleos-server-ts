import { ICalendarioRepository } from "../../../domain/repositories/ICalendarioRepository";
import { INucleoRepository } from "../../../domain/repositories/INucleoRepository";
import { GetEventoByIdQuery } from "./GetEventoByIdQuery";
import { NotFoundException } from "../../common/exceptions/not-found.exception";

export class GetEventoByIdHandler {
  constructor(
    private readonly eventoRepository: ICalendarioRepository,
    private readonly nucleoRepository: INucleoRepository,
  ) {}

  async execute(query: GetEventoByIdQuery): Promise<any> {
    const { userId, eventoId, nucleoId } = query;

    const nucleo = await this.nucleoRepository.findById(nucleoId, userId);
    if (!nucleo) {
      throw new NotFoundException("Núcleo", nucleoId);
    }

    const evento = await this.eventoRepository.findById(eventoId, nucleoId);
    if (!evento) {
      throw new NotFoundException("Evento", eventoId);
    }

    return {
      id: evento.id,
      nucleoId: evento.nucleoId,
      titulo: evento.titulo,
      descricao: evento.descricao,
      dataEvento: evento.dataEvento.toISOString(),
      duracaoMinutos: evento.duracaoMinutos,
      createdAt: evento.createdAt.toISOString(),
      updatedAt: evento.updatedAt.toISOString(),
    };
  }
}
