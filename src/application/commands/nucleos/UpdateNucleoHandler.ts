import { INucleoRepository } from "../../../domain/repositories/INucleoRepository";
import { UpdateNucleoCommand } from "./UpdateNucleoCommand";
import { NucleoResponseDto } from "../../dto/nucleo.dto";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class UpdateNucleoHandler {
  constructor(
    private readonly nucleoRepository: INucleoRepository,
    // ✅ REMOVA o CurrentUserService
  ) {}

  async execute(command: UpdateNucleoCommand): Promise<NucleoResponseDto> {
    // ✅ USA O userId DO COMMAND
    const {
      id,
      userId,
      nome,
      descricao,
      tipo,
      corDestaque,
      imagemCapa,
      iconId,
    } = command;

    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const nucleo = await this.nucleoRepository.findById(id, userId);

    if (!nucleo) {
      throw new NotFoundException("Núcleo", id);
    }

    // Verificar se o usuário é o dono
    if (nucleo.userId !== userId) {
      throw new ForbiddenException(
        "Você não tem permissão para editar este núcleo",
      );
    }

    if (nome !== undefined) nucleo.updateNome(nome);
    if (descricao !== undefined) nucleo.updateDescricao(descricao);
    if (tipo !== undefined) nucleo.updateTipo(tipo);
    if (corDestaque !== undefined) nucleo.updateCor(corDestaque);
    if (imagemCapa !== undefined) nucleo.updateImagem(imagemCapa);
    if (iconId !== undefined) nucleo.updateIcon(iconId);

    await this.nucleoRepository.update(nucleo);

    return {
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
    };
  }
}
