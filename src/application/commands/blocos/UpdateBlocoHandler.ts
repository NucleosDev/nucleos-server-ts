// src/application/commands/blocos/UpdateBlocoHandler.ts
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
    const {
      id,
      userId,
      nucleoId,
      titulo,
      tipo,
      posicao,
      configuracoes,
      parentId,
    } = command;

    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const bloco = await this.blocoRepository.findById(id, nucleoId);
    if (!bloco) {
      throw new NotFoundException("Bloco", id);
    }

    if (titulo !== undefined) {
      bloco.updateTitulo(titulo);
    }

    if (tipo !== undefined) {
      if (!isTipoBloco(tipo)) {
        throw new Error(`Tipo de bloco inválido: ${tipo}`);
      }
      bloco.updateTipo(tipo as TipoBloco);
    }

    if (posicao !== undefined) {
      bloco.updatePosicao(posicao);
    }

    if (configuracoes !== undefined) {
      bloco.updateConfiguracoes(configuracoes);
    }

    // NOVO: Atualizar parent
    if (parentId !== undefined) {
      bloco.moveToParent(parentId);
    }

    await this.blocoRepository.update(bloco);

    return {
      id: bloco.id,
      nucleoId: bloco.nucleoId,
      tipo: bloco.tipo,
      titulo: bloco.titulo,
      posicao: bloco.posicao,
      configuracoes: bloco.configuracoes,
      parentId: bloco.parentId,
      path: bloco.path,
      depth: bloco.depth,
      isCanvas: bloco.isCanvas,
      createdAt: bloco.createdAt.toISOString(),
      updatedAt: bloco.updatedAt.toISOString(),
      deletedAt: bloco.deletedAt?.toISOString() || null,
    };
  }
}
