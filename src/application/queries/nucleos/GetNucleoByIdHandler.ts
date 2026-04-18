import { INucleoRepository } from "../../../domain/repositories/INucleoRepository";
import { GetNucleoByIdQuery } from "./GetNucleoByIdQuery";
import { NucleoResponseDto } from "../../dto/nucleo.dto";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { NucleoIconRepository } from "../../../infrastructure/persistence/repositories/NucleoIconRepository";

export class GetNucleoByIdHandler {
  constructor(
    private readonly nucleoRepository: INucleoRepository,
    private readonly nucleoIconRepository: NucleoIconRepository,
  ) {}

  async execute(query: GetNucleoByIdQuery): Promise<NucleoResponseDto> {
    const nucleo = await this.nucleoRepository.findById(query.id, query.userId);
    if (!nucleo) {
      throw new NotFoundException("Núcleo", query.id);
    }

    let iconName: string | null = null;
    if (nucleo.iconId) {
      const icon = await this.nucleoIconRepository.findById(nucleo.iconId);
      iconName = icon?.name ?? null;
    }

    return {
      id: nucleo.id,
      userId: nucleo.userId,
      nome: nucleo.nome,
      descricao: nucleo.descricao,
      tipo: nucleo.tipo,
      corDestaque: nucleo.corDestaque,
      imagemCapa: nucleo.imagemCapa,
      iconId: iconName,
      createdAt: nucleo.createdAt,
      updatedAt: nucleo.updatedAt,
      deletedAt: nucleo.deletedAt,
    };
  }
}
