import { Habito } from "../entities/Habito";
import { HabitoRegistro } from "../entities/HabitoRegistro";

export interface IHabitoRepository {
  // Habito CRUD
  save(habito: Habito): Promise<void>;
  findById(id: string): Promise<Habito | null>;
  findAllByBlocoId(blocoId: string): Promise<Habito[]>;
  update(habito: Habito): Promise<void>;
  delete(id: string): Promise<void>;

  // Registros
  saveRegistro(registro: HabitoRegistro): Promise<void>;
  findRegistroByHabitoAndDate(
    habitoId: string,
    data: Date,
  ): Promise<HabitoRegistro | null>;
  findRegistrosByHabito(
    habitoId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<HabitoRegistro[]>;
  getStreak(habitoId: string): Promise<{ atual: number; maximo: number }>;
  isCompletoHoje(habitoId: string): Promise<boolean>;
}
