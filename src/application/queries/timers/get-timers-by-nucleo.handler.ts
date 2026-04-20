// application/queries/timers/get-timers-by-nucleo.handler.ts
import { GetTimersByNucleoQuery } from "./get-timers-by-nucleo.query";
import { TimerDto } from "../../dto/timer.dto";
import { TimerRepository } from "../../../infrastructure/persistence/repositories/TimerRepository";
import { NucleoRepository } from "../../../infrastructure/persistence/repositories/NucleoRepository";
import { NotFoundException } from "../../common/exceptions/not-found.exception";

export class GetTimersByNucleoHandler {
  private timerRepository: TimerRepository;
  private nucleoRepository: NucleoRepository;

  constructor() {
    this.timerRepository = new TimerRepository();
    this.nucleoRepository = new NucleoRepository();
  }

  async handle(query: GetTimersByNucleoQuery): Promise<TimerDto[]> {
    const nucleo = await this.nucleoRepository.findById(
      query.nucleoId,
      query.userId,
    );

    if (!nucleo) {
      throw new NotFoundException("Núcleo", query.nucleoId);
    }

    const timers = await this.timerRepository.findByNucleoId(
      query.nucleoId,
      query.userId,
    );

    return timers.map((timer) => ({
      id: timer.id,
      nucleoId: timer.nucleoId,
      titulo: timer.titulo,
      inicio: timer.inicio.toISOString(),
      fim: timer.fim?.toISOString() || null,
      duracaoSegundos: timer.duracaoSegundos,
      modo: timer.modo,
      createdAt: timer.createdAt.toISOString(),
      updatedAt: timer.updatedAt.toISOString(),
    }));
  }
}
