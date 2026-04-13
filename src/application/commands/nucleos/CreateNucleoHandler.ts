import { INucleoRepository } from "../../../domain/repositories/INucleoRepository";
import { CreateNucleoCommand } from "./CreateNucleoCommand";
import { NucleoResponseDto } from "../../dto/nucleo.dto";
import { Nucleo } from "../../../domain/entities/Nucleo";

export class CreateNucleoHandler {
  constructor(private readonly nucleoRepository: INucleoRepository) {}

  async execute(command: CreateNucleoCommand): Promise<NucleoResponseDto> {
    const { userId, nome, descricao, tipo, corDestaque, imagemCapa, iconId } =
      command;

    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const nucleo = Nucleo.create({
      userId,
      nome,
      descricao: descricao || null,
      tipo: tipo || "pessoal",
      corDestaque: corDestaque || null,
      imagemCapa: imagemCapa || null,
      iconId: iconId || null,
    });

    await this.nucleoRepository.save(nucleo);

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
