import { INucleoRepository } from "../../../domain/repositories/INucleoRepository";
import { GetNucleosQuery } from "./GetNucleosQuery";
import { NucleoResponseDto } from "../../dto/nucleo.dto";

export class GetNucleosHandler {
  constructor(
    private readonly nucleoRepository: INucleoRepository,
    // ✅ REMOVA o CurrentUserService
  ) {}

  async execute(query: GetNucleosQuery): Promise<NucleoResponseDto[]> {
    // ✅ USA O userId DO QUERY
    const userId = query.userId;

    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const nucleos = await this.nucleoRepository.findAllByUserId(userId);

    return nucleos.map((nucleo) => ({
      id: nucleo.id,
      userId: nucleo.userId,
      nome: nucleo.nome,
      descricao: nucleo.descricao,
      tipo: nucleo.tipo,
      corDestaque: nucleo.corDestaque,
      imagemCapa: nucleo.imagemCapa,
      iconId: nucleo.iconId,
      createdAt: nucleo.createdAt.toISOString(),
      updatedAt: nucleo.updatedAt.toISOString(),
      deletedAt: nucleo.deletedAt?.toISOString() || null,
    }));
  }
}
