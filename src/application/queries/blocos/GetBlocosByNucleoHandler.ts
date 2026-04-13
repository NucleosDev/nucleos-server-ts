import { IBlocoRepository } from "../../../domain/repositories/IBlocoRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { GetBlocosByNucleoQuery } from "./GetBlocosByNucleoQuery";
import { BlocoResponseDto } from "../../dto/bloco.dto";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class GetBlocosByNucleoHandler {
  constructor(
    private readonly blocoRepository: IBlocoRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(query: GetBlocosByNucleoQuery): Promise<BlocoResponseDto[]> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar permissão
    const nucleoCheck = await pool.query(
      `SELECT id FROM nucleos WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [query.nucleoId, userId],
    );

    if (nucleoCheck.rows.length === 0) {
      throw new Error("Núcleo não encontrado ou sem permissão");
    }

    const blocos = await this.blocoRepository.findAllByNucleoId(query.nucleoId);

    return blocos.map((bloco) => ({
      id: bloco.id,
      nucleoId: bloco.nucleoId,
      tipo: bloco.tipo,
      titulo: bloco.titulo,
      posicao: bloco.posicao,
      configuracoes: bloco.configuracoes,
      createdAt: bloco.createdAt.toISOString(),
      updatedAt: bloco.updatedAt.toISOString(),
      deletedAt: bloco.deletedAt?.toISOString() || null,
    }));
  }
}
