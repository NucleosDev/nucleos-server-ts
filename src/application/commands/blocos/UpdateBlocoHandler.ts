import { IBlocoRepository } from "../../../domain/repositories/IBlocoRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { UpdateBlocoCommand } from "./UpdateBlocoCommand"
import { BlocoResponseDto } from "../../dto/bloco.dto";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class UpdateBlocoHandler {
  constructor(
    private readonly blocoRepository: IBlocoRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(command: UpdateBlocoCommand): Promise<BlocoResponseDto> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar permissão via núcleo
    const nucleoCheck = await pool.query(
      `SELECT n.id FROM nucleos n
       INNER JOIN blocos b ON b.nucleo_id = n.id
       WHERE b.id = $1 AND n.user_id = $2 AND n.deleted_at IS NULL AND b.deleted_at IS NULL`,
      [command.id, userId],
    );

    if (nucleoCheck.rows.length === 0) {
      throw new Error("Bloco não encontrado ou sem permissão");
    }

    const bloco = await this.blocoRepository.findById(
      command.id,
      command.nucleoId,
    );
    if (!bloco) {
      throw new Error("Bloco não encontrado");
    }

    if (command.titulo !== undefined) bloco.updateTitulo(command.titulo);
    if (command.tipo !== undefined) bloco.updateTipo(command.tipo);
    if (command.posicao !== undefined) bloco.updatePosicao(command.posicao);
    if (command.configuracoes !== undefined)
      bloco.updateConfiguracoes(command.configuracoes);

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
