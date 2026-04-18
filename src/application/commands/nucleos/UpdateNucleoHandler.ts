import { INucleoRepository } from "../../../domain/repositories/INucleoRepository";
import { UpdateNucleoCommand } from "./UpdateNucleoCommand";
import { NucleoResponseDto } from "../../dto/nucleo.dto";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";
import { NucleoIconRepository } from "../../../infrastructure/persistence/repositories/NucleoIconRepository";
import { isValidUuid } from "../../../shared/utils/uuid";

export class UpdateNucleoHandler {
  constructor(
    private readonly nucleoRepository: INucleoRepository,
    private readonly nucleoIconRepository: NucleoIconRepository,
  ) {}

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

    if (iconId !== undefined) {
      if (iconId === null) {
        nucleo.updateIcon(null);
      } else if (isValidUuid(iconId)) {
        nucleo.updateIcon(iconId);
      } else {
        const icon = await this.nucleoIconRepository.findByName(iconId);
        if (!icon) {
          throw new Error(`Ícone "${iconId}" não encontrado.`);
        }
        nucleo.updateIcon(icon.id);
      }
    }

    await this.nucleoRepository.update(nucleo);

    // Retorna o nome do ícone para o frontend
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
