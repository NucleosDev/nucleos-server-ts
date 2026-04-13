// application/queries/nucleos/GetNucleosHandler.ts
import { INucleoRepository } from "../../../domain/repositories/INucleoRepository";
import { GetNucleosQuery } from "./GetNucleosQuery";
import { NucleoResponseDto } from "../../dto/nucleo.dto";

export class GetNucleosHandler {
  constructor(private readonly nucleoRepository: INucleoRepository) {}

  async execute(query: GetNucleosQuery): Promise<NucleoResponseDto[]> {
    const nucleos = await this.nucleoRepository.findAllByUserId(query.userId);
    return nucleos.map((nucleo) => ({
      id: nucleo.id,
      userId: nucleo.userId,
      nome: nucleo.nome,
      descricao: nucleo.descricao,
      tipo: nucleo.tipo,
      corDestaque: nucleo.corDestaque,
      imagemCapa: nucleo.imagemCapa,
      iconId: nucleo.iconId,
      createdAt: nucleo.createdAt,
      updatedAt: nucleo.updatedAt,
      deletedAt: nucleo.deletedAt,
    }));
  }
}
