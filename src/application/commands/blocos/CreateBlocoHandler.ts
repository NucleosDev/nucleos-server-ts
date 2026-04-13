// application/commands/blocos/CreateBlocoHandler.ts
import { IBlocoRepository } from "../../../domain/repositories/IBlocoRepository";
import { INucleoRepository } from "../../../domain/repositories/INucleoRepository";
import { CreateBlocoCommand } from "./CreateBlocoCommand";
import { Bloco } from "../../../domain/entities/Bloco";
import {
  isTipoBloco,
  TipoBloco,
} from "../../../domain/value-objects/TipoBloco";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class CreateBlocoHandler {
  constructor(
    private readonly blocoRepository: IBlocoRepository,
    private readonly nucleoRepository: INucleoRepository,
  ) {}

  async execute(command: CreateBlocoCommand): Promise<any> {
    const { userId, nucleoId, tipo, titulo, posicao, configuracoes } = command;

    const nucleo = await this.nucleoRepository.findById(nucleoId, userId);
    if (!nucleo) {
      throw new NotFoundException("Núcleo", nucleoId);
    }

    // ✅ Validar e converter tipo
    if (!isTipoBloco(tipo)) {
      throw new Error(`Tipo de bloco inválido: ${tipo}`);
    }

    //  Garantir que posicao seja number (fallback para 0)
    const posicaoFinal = posicao !== undefined ? posicao : 0;

    // Usar Bloco.create com tipos corretos
    const bloco = Bloco.create({
      nucleoId,
      tipo: tipo as TipoBloco,
      titulo: titulo || null,
      posicao: posicaoFinal,
      configuracoes: configuracoes || {},
    });

    await this.blocoRepository.save(bloco);

    return {
      id: bloco.id,
      nucleoId: bloco.nucleoId,
      tipo: bloco.tipo,
      titulo: bloco.titulo,
      posicao: bloco.posicao,
      configuracoes: bloco.configuracoes,
      createdAt: bloco.createdAt.toISOString(),
      updatedAt: bloco.updatedAt.toISOString(),
    };
  }
}
