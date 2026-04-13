import { ICalendarioRepository } from "../../../domain/repositories/ICalendarioRepository";
import { INucleoRepository } from "../../../domain/repositories/INucleoRepository";
import { UpdateEventoCommand } from "./UpdateEventoCommand";
import { NotFoundException } from "../../common/exceptions/not-found.exception";

export class UpdateEventoHandler {
  constructor(
    private readonly eventoRepository: ICalendarioRepository,
    private readonly nucleoRepository: INucleoRepository,
  ) {}

  async execute(command: UpdateEventoCommand): Promise<any> {
    const {
      userId,
      eventoId,
      nucleoId,
      titulo,
      descricao,
      dataEvento,
      duracaoMinutos,
    } = command;

    const nucleo = await this.nucleoRepository.findById(nucleoId, userId);
    if (!nucleo) throw new NotFoundException("Núcleo", nucleoId);

    const evento = await this.eventoRepository.findById(eventoId, nucleoId);
    if (!evento) throw new NotFoundException("Evento", eventoId);

    if (titulo !== undefined) evento.updateTitulo(titulo);
    if (descricao !== undefined) evento.updateDescricao(descricao);
    if (dataEvento !== undefined) evento.updateDataEvento(dataEvento);
    if (duracaoMinutos !== undefined) evento.updateDuracao(duracaoMinutos);

    await this.eventoRepository.update(evento);

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
