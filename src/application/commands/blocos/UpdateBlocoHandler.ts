// application/commands/blocos/UpdateBlocoHandler.ts
import { IBlocoRepository } from "../../../domain/repositories/IBlocoRepository";
import { UpdateBlocoCommand } from "./UpdateBlocoCommand";
import { BlocoResponseDto } from "../../dto/bloco.dto";
import {
  isTipoBloco,
  TipoBloco,
} from "../../../domain/value-objects/TipoBloco";
import { NotFoundException } from "../../common/exceptions/not-found.exception";

export class UpdateBlocoHandler {
  constructor(private readonly blocoRepository: IBlocoRepository) {}

  async execute(command: UpdateBlocoCommand): Promise<BlocoResponseDto> {
    const { id, userId, nucleoId, titulo, tipo, posicao, configuracoes } =
      command;

    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const bloco = await this.blocoRepository.findById(id, nucleoId);
    if (!bloco) {
      throw new NotFoundException("Bloco", id);
    }

    // ✅ Atualizar titulo (string)
    if (titulo !== undefined) {
      bloco.updateTitulo(titulo);
    }

    // ✅ Validar e converter tipo antes de atualizar
    if (tipo !== undefined) {
      if (!isTipoBloco(tipo)) {
        throw new Error(`Tipo de bloco inválido: ${tipo}`);
      }
      bloco.updateTipo(tipo as TipoBloco);
    }

    // ✅ Atualizar posicao (number)
    if (posicao !== undefined) {
      bloco.updatePosicao(posicao);
    }

    // ✅ Atualizar configuracoes
    if (configuracoes !== undefined) {
      bloco.updateConfiguracoes(configuracoes);
    }

    await this.blocoRepository.update(bloco);

    return {
      id: bloco.id,
      nucleoId: bloco.nucleoId,
      tipo: bloco.tipo,
      titulo: bloco.titulo,
      posicao: bloco.posicao,
      configuracoes: bloco.configuracoes,
      createdAt: bloco.createdAt.toISOString(),
      updatedAt: bloco.updatedAt.toISOString(),
      deletedAt: bloco.deletedAt?.toISOString() || null,
    };
  }
}
