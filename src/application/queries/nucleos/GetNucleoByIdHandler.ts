// application/queries/nucleos/GetNucleoByIdHandler.ts
import { INucleoRepository } from "../../../domain/repositories/INucleoRepository";
import { GetNucleoByIdQuery } from "./GetNucleoByIdQuery";
import { NucleoDetailResponseDto } from "../../dto/nucleo.dto";
import { NotFoundException } from "../../common/exceptions/not-found.exception";

export class GetNucleoByIdHandler {
  constructor(private readonly nucleoRepository: INucleoRepository) {}

  async execute(query: GetNucleoByIdQuery): Promise<NucleoDetailResponseDto> {
    const { id, userId } = query;

    const nucleo = await this.nucleoRepository.findById(id, userId);

    if (!nucleo) {
      throw new NotFoundException("Núcleo", id);
    }

    return {
      id: nucleo.id,
      userId: nucleo.userId,
      iconId: nucleo.iconId,
      nome: nucleo.nome,
      descricao: nucleo.descricao,
      tipo: nucleo.tipo,
      corDestaque: nucleo.corDestaque,
      imagemCapa: nucleo.imagemCapa,
      createdAt: nucleo.createdAt.toISOString(),
      updatedAt: nucleo.updatedAt.toISOString(),
      deletedAt: nucleo.deletedAt?.toISOString() || null,
    };
  }
}
