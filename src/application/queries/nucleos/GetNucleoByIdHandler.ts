import { INucleoRepository } from "../../../domain/repositories/INucleoRepository";
import { GetNucleoByIdQuery } from "./GetNucleoByIdQuery";
import { NucleoDetailResponseDto } from "../../dto/nucleo.dto";
import { NotFoundException } from "../../common/exceptions/not-found.exception";

export class GetNucleoByIdHandler {
  constructor(
    private readonly nucleoRepository: INucleoRepository,
    // ✅ REMOVA o CurrentUserService
  ) {}

  async execute(query: GetNucleoByIdQuery): Promise<NucleoDetailResponseDto> {
    // ✅ USA O userId DO QUERY
    const { id, userId } = query;

    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

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
      blocos:
        nucleo.blocos?.map((b) => ({
          id: b.id,
          tipo: b.tipo,
          titulo: b.titulo,
        })) || [],
      calendarioEventos:
        nucleo.calendarioEventos?.map((e) => ({
          id: e.id,
          titulo: e.titulo,
        })) || [],
      metas: nucleo.metas?.map((m) => ({ id: m.id, titulo: m.titulo })) || [],
      achievements:
        nucleo.achievements?.map((a) => ({
          id: a.id,
          achievementType: a.achievementType,
        })) || [],
    };
  }
}
