import { CalendarioEvento } from "../entities/CalendarioEvento";

export interface ICalendarioRepository {
  save(evento: CalendarioEvento): Promise<void>;
  findById(id: string, nucleoId: string): Promise<CalendarioEvento | null>;
  findAllByNucleoId(
    nucleoId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<CalendarioEvento[]>;
  update(evento: CalendarioEvento): Promise<void>;
  delete(id: string, nucleoId: string): Promise<void>;
}
