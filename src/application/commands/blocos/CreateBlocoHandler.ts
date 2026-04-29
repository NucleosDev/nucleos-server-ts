// src/application/commands/blocos/CreateBlocoHandler.ts
import { IBlocoRepository } from "../../../domain/repositories/IBlocoRepository";
import { INucleoRepository } from "../../../domain/repositories/INucleoRepository";
import { CreateBlocoCommand } from "./CreateBlocoCommand";
import { Bloco } from "../../../domain/entities/Bloco";
import {
  isTipoBloco,
  TipoBloco,
  TIPO_BLOCO_VALORES,
} from "../../../domain/value-objects/TipoBloco";
import { NotFoundException } from "../../common/exceptions/not-found.exception";

export class CreateBlocoHandler {
  constructor(
    private readonly blocoRepository: IBlocoRepository,
    private readonly nucleoRepository: INucleoRepository,
  ) {}

  async execute(command: CreateBlocoCommand): Promise<any> {
    const { userId, nucleoId, tipo, titulo, posicao, configuracoes, parentId } =
      command;

    const nucleo = await this.nucleoRepository.findById(nucleoId, userId);
    if (!nucleo) {
      throw new NotFoundException("Núcleo", nucleoId);
    }

    // Validar parent se fornecido
    if (parentId) {
      const parent = await this.blocoRepository.findById(parentId, nucleoId);
      if (!parent) {
        throw new NotFoundException("Bloco pai", parentId);
      }
    }

    if (!isTipoBloco(tipo)) {
      throw new Error(
        `Tipo de bloco inválido. Tipos válidos: ${TIPO_BLOCO_VALORES.join(", ")}`,
      );
    }

    const posicaoFinal = posicao !== undefined ? posicao : 0;

    const bloco = Bloco.create({
      nucleoId,
      tipo: tipo as TipoBloco,
      titulo: titulo || null,
      posicao: posicaoFinal,
      configuracoes: configuracoes || {},
      parentId: parentId || null,
    });

    await this.blocoRepository.save(bloco);

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
    };
  }
}
