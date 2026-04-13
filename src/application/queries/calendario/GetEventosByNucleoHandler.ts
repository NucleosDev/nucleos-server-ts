import { ICalendarioRepository } from "../../../domain/repositories/ICalendarioRepository";
import { INucleoRepository } from "../../../domain/repositories/INucleoRepository";
import { GetEventosByNucleoQuery } from "./GetEventosByNucleoQuery";
import { NotFoundException } from "../../common/exceptions/not-found.exception";

export class GetEventosByNucleoHandler {
  constructor(
    private readonly eventoRepository: ICalendarioRepository,
    private readonly nucleoRepository: INucleoRepository,
  ) {}

  async execute(query: GetEventosByNucleoQuery): Promise<any[]> {
    const { userId, nucleoId, startDate, endDate } = query;

    const nucleo = await this.nucleoRepository.findById(nucleoId, userId);
    if (!nucleo) {
      throw new NotFoundException("Núcleo", nucleoId);
    }

    const eventos = await this.eventoRepository.findAllByNucleoId(
      nucleoId,
      startDate,
      endDate,
    );
    return eventos.map((e) => ({
      id: e.id,
      nucleoId: e.nucleoId,
      titulo: e.titulo,
      descricao: e.descricao,
      dataEvento: e.dataEvento.toISOString(),
      duracaoMinutos: e.duracaoMinutos,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }));
  }
}
