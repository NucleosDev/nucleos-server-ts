import { Nucleo } from "../entities/Nucleo";

export interface INucleoRepository {
  save(nucleo: Nucleo): Promise<void>;
  findById(id: string, userId: string): Promise<Nucleo | null>;
  findAllByUserId(userId: string): Promise<Nucleo[]>;
  update(nucleo: Nucleo): Promise<void>;
  delete(id: string, userId: string): Promise<void>;
}
