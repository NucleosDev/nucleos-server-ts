import { Bloco } from "../entities/Bloco";
import { BlocoCalculo } from "../entities/BlocoCalculo";

export interface IBlocoRepository {
  save(bloco: Bloco): Promise<void>;
  findById(id: string, nucleoId: string): Promise<Bloco | null>;
  findAllByNucleoId(nucleoId: string): Promise<Bloco[]>;
  update(bloco: Bloco): Promise<void>;
  delete(id: string, nucleoId: string): Promise<void>;
  reorder(
    nucleoId: string,
    orders: { id: string; posicao: number }[],
  ): Promise<void>;

  // BlocoCalculo
  saveCalculo(calculo: BlocoCalculo): Promise<void>;
  findCalculoByBlocoId(blocoId: string): Promise<BlocoCalculo | null>;
  deleteCalculo(blocoId: string): Promise<void>;
}
