import { Nucleo } from "../entities/Nucleo";
import { INucleoRepository } from "../repositories/INucleoRepository";

export class NucleoDomainService {
  constructor(private readonly nucleoRepository: INucleoRepository) {}

  async canUserCreateMoreNucleos(
    userId: string,
    planMaxNucleos: number,
  ): Promise<boolean> {
    const userNucleos = await this.nucleoRepository.findAllByUserId(userId);
    return userNucleos.length < planMaxNucleos;
  }

  async isNomeUniqueForUser(
    userId: string,
    nome: string,
    excludeId?: string,
  ): Promise<boolean> {
    const nucleos = await this.nucleoRepository.findAllByUserId(userId);
    return !nucleos.some(
      (n) =>
        n.nome.toLowerCase() === nome.toLowerCase() &&
        (!excludeId || n.id !== excludeId),
    );
  }
}
