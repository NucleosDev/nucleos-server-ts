import { INucleoRepository } from "../../../domain/repositories/INucleoRepository";
import { CreateNucleoCommand } from "./CreateNucleoCommand";
import { NucleoResponseDto } from "../../dto/nucleo.dto";
import { Nucleo } from "../../../domain/entities/Nucleo";
import { NucleoIconRepository } from "../../../infrastructure/persistence/repositories/NucleoIconRepository";
import { isValidUuid } from "../../../shared/utils/uuid";

export class CreateNucleoHandler {
  constructor(
    private readonly nucleoRepository: INucleoRepository,
    private readonly nucleoIconRepository: NucleoIconRepository,
  ) {}

  async execute(command: CreateNucleoCommand): Promise<NucleoResponseDto> {
    const { userId, nome, descricao, tipo, corDestaque, imagemCapa, iconId } =
      command;

    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Converte iconId textual para UUID (se necessário)
    let iconUuid: string | null = null;
    if (iconId) {
      if (isValidUuid(iconId)) {
        iconUuid = iconId;
      } else {
        const icon = await this.nucleoIconRepository.findByName(iconId);
        if (!icon) {
          throw new Error(`Ícone "${iconId}" não encontrado.`);
        }
        iconUuid = icon.id;
      }
    }

    const nucleo = Nucleo.create({
      userId,
      nome,
      descricao: descricao || null,
      tipo: tipo || "pessoal",
      corDestaque: corDestaque || null,
      imagemCapa: imagemCapa || null,
      iconId: iconUuid,
    });

    await this.nucleoRepository.save(nucleo);

    // Retorna o nome do ícone (não o UUID) para manter compatibilidade com o frontend
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
