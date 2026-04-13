import { CalendarioEvento } from "../entities/CalendarioEvento";

export interface ICalendarioRepository {
  save(evento: CalendarioEvento): Promise<void>;
  findById(id: string): Promise<CalendarioEvento | null>;
  findAllByNucleoId(nucleoId: string): Promise<CalendarioEvento[]>;
  findAllByDateRange(
    nucleoId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CalendarioEvento[]>;
  update(evento: CalendarioEvento): Promise<void>;
  delete(id: string): Promise<void>;
}
