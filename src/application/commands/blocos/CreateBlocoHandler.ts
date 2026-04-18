// application/commands/blocos/CreateBlocoHandler.ts
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
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class CreateBlocoHandler {
  constructor(
    private readonly blocoRepository: IBlocoRepository,
    private readonly nucleoRepository: INucleoRepository,
  ) {}

  async execute(command: CreateBlocoCommand): Promise<any> {
    const { userId, nucleoId, tipo, titulo, posicao, configuracoes } = command;

    // 🔍 LOG 1: Mostrar o comando recebido
    console.log("📥 [CreateBlocoHandler] Comando recebido:", {
      userId,
      nucleoId,
      tipo,
      titulo,
      posicao,
      configuracoes,
    });

    // 🔍 LOG 2: Verificar o tipo exato e seu prototype
    console.log("📥 [CreateBlocoHandler] Tipo recebido:", JSON.stringify(tipo));
    console.log("📥 [CreateBlocoHandler] typeof tipo:", typeof tipo);

    const nucleo = await this.nucleoRepository.findById(nucleoId, userId);
    if (!nucleo) {
      throw new NotFoundException("Núcleo", nucleoId);
    }

    // 🔍 LOG 3: Mostrar os valores do enum TipoBloco
    console.log(
      "📥 [CreateBlocoHandler] Valores do enum TipoBloco:",
      Object.values(TIPO_BLOCO_VALORES),
    );

    // 🔍 LOG 4: Testar isTipoBloco manualmente
    const resultadoIsTipoBloco = isTipoBloco(tipo);
    console.log(
      "📥 [CreateBlocoHandler] isTipoBloco(tipo) retornou:",
      resultadoIsTipoBloco,
    );

    // ✅ Validar e converter tipo
    if (!resultadoIsTipoBloco) {
      console.error("❌ [CreateBlocoHandler] Tipo inválido detectado!");
      console.error("❌ Tipo recebido:", tipo);
      console.error("❌ Tipos válidos:", Object.values(TIPO_BLOCO_VALORES));
      throw new Error(
        `Tipo de bloco inválido. Tipos válidos: ${Object.values(TIPO_BLOCO_VALORES).join(", ")}`,
      );
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

    console.log("✅ [CreateBlocoHandler] Bloco criado com sucesso:", bloco.id);

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
