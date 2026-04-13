// domain/repositories/IBlocoRepository.ts
import { Bloco } from "../entities/Bloco";
import { BlocoCalculo } from "../entities/BlocoCalculo";

export interface IBlocoRepository {
  save(bloco: Bloco): Promise<void>;
  findById(id: string, nucleoId: string): Promise<Bloco | null>;
  findByNucleoId(nucleoId: string): Promise<Bloco[]>; //  Renomeado para consistência
  update(bloco: Bloco): Promise<void>;
  delete(id: string): Promise<void>; // Remover nucleoId, usar só id
  updatePosition(id: string, posicao: number, nucleoId: string): Promise<void>; // Adicionado

  // BlocoCalculo
  saveCalculo(calculo: BlocoCalculo): Promise<void>;
  findCalculoByBlocoId(blocoId: string): Promise<BlocoCalculo | null>;
  deleteCalculo(blocoId: string): Promise<void>;
}
