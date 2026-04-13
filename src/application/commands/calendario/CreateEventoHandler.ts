// src/application/commands/calendario/CreateEventoHandler.ts
import { ICalendarioRepository } from "../../../domain/repositories/ICalendarioRepository";
import { INucleoRepository } from "../../../domain/repositories/INucleoRepository";
import { CalendarioEvento } from "../../../domain/entities/CalendarioEvento";
import { CreateEventoCommand } from "./CreateEventoCommand";
import { NotFoundException } from "../../common/exceptions/not-found.exception";

export class CreateEventoHandler {
  constructor(
    private readonly eventoRepository: ICalendarioRepository,
    private readonly nucleoRepository: INucleoRepository,
  ) {}

  async execute(command: CreateEventoCommand): Promise<any> {
    const { userId, nucleoId, titulo, dataEvento, descricao, duracaoMinutos } =
      command;

    const nucleo = await this.nucleoRepository.findById(nucleoId, userId);
    if (!nucleo) throw new NotFoundException("Núcleo", nucleoId);

    const evento = CalendarioEvento.create({
      nucleoId,
      titulo,
      descricao,
      dataEvento,
      duracaoMinutos,
    });

    await this.eventoRepository.save(evento);

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
