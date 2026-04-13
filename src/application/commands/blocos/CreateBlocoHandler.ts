import { Bloco } from "../../../domain/entities/Bloco";
import { IBlocoRepository } from "../../../domain/repositories/IBlocoRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { CreateBlocoCommand } from "./CreateBlocoCommand";
import { BlocoResponseDto } from "../../dto/bloco.dto";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class CreateBlocoHandler {
  constructor(
    private readonly blocoRepository: IBlocoRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(command: CreateBlocoCommand): Promise<BlocoResponseDto> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar se o núcleo pertence ao usuário
    const nucleoCheck = await pool.query(
      `SELECT id FROM nucleos WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [command.nucleoId, userId],
    );

    if (nucleoCheck.rows.length === 0) {
      throw new Error("Núcleo não encontrado ou sem permissão");
    }

    // Buscar próxima posição
    const posicao =
      command.posicao ?? (await this.getNextPosition(command.nucleoId));

    const bloco = Bloco.create({
      nucleoId: command.nucleoId,
      tipo: command.tipo,
      titulo: command.titulo,
      posicao,
      configuracoes: command.configuracoes || {},
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
      deletedAt: bloco.deletedAt?.toISOString() || null,
    };
  }

  private async getNextPosition(nucleoId: string): Promise<number> {
    const result = await pool.query(
      `SELECT COALESCE(MAX(posicao), -1) + 1 as next_pos 
       FROM blocos 
       WHERE nucleo_id = $1 AND deleted_at IS NULL`,
      [nucleoId],
    );
    return result.rows[0].next_pos;
  }
}
