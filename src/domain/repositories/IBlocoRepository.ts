// src/domain/repositories/IBlocoRepository.ts
import { Bloco } from "../entities/Bloco";
import { BlocoCalculo } from "../entities/BlocoCalculo";

export interface IBlocoRepository {
  save(bloco: Bloco): Promise<void>;
  findById(id: string, nucleoId: string): Promise<Bloco | null>;
  findByNucleoId(nucleoId: string): Promise<Bloco[]>;
  update(bloco: Bloco): Promise<void>;
  delete(id: string): Promise<void>;
  updatePosition(id: string, posicao: number, nucleoId: string): Promise<void>;

  // NOVOS MÉTODOS PARA NESTING
  findByParentId(parentId: string, nucleoId: string): Promise<Bloco[]>;
  findRootBlocos(nucleoId: string): Promise<Bloco[]>;
  findDescendants(blocoId: string): Promise<Bloco[]>;
  findAncestors(blocoId: string): Promise<Bloco[]>;
  moveToParent(
    blocoId: string,
    newParentId: string | null,
    position: number,
  ): Promise<void>;
  reorderChildren(
    parentId: string,
    orders: { id: string; posicao: number }[],
  ): Promise<void>;

  // BlocoCalculo (inalterado)
  saveCalculo(calculo: BlocoCalculo): Promise<void>;
  findCalculoByBlocoId(blocoId: string): Promise<BlocoCalculo | null>;
  deleteCalculo(blocoId: string): Promise<void>;
}
