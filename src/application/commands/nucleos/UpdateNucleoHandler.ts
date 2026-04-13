// application/commands/nucleos/UpdateNucleoHandler.ts
import { INucleoRepository } from "../../../domain/repositories/INucleoRepository";
import { UpdateNucleoCommand } from "./UpdateNucleoCommand";
import { NucleoResponseDto } from "../../dto/nucleo.dto";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class UpdateNucleoHandler {
  constructor(private readonly nucleoRepository: INucleoRepository) {}

  async execute(command: UpdateNucleoCommand): Promise<NucleoResponseDto> {
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
      createdAt: nucleo.createdAt,
      updatedAt: nucleo.updatedAt,
      deletedAt: nucleo.deletedAt,
    };
  }
}
