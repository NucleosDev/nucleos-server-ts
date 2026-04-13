import { ICalendarioRepository } from "../../../domain/repositories/ICalendarioRepository";
import { INucleoRepository } from "../../../domain/repositories/INucleoRepository";
import { DeleteEventoCommand } from "./DeleteEventoCommand";
import { NotFoundException } from "../../common/exceptions/not-found.exception";

export class DeleteEventoHandler {
  constructor(
    private readonly eventoRepository: ICalendarioRepository,
    private readonly nucleoRepository: INucleoRepository,
  ) {}

  async execute(command: DeleteEventoCommand): Promise<void> {
    const { userId, eventoId, nucleoId } = command;

    const nucleo = await this.nucleoRepository.findById(nucleoId, userId);
    if (!nucleo) throw new NotFoundException("Núcleo", nucleoId);

    const evento = await this.eventoRepository.findById(eventoId, nucleoId);
    if (!evento) throw new NotFoundException("Evento", eventoId);

    await this.eventoRepository.delete(eventoId, nucleoId);
  }
}
