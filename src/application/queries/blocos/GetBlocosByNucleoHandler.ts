// src/application/queries/blocos/GetBlocosByNucleoHandler.ts
import { IBlocoRepository } from "../../../domain/repositories/IBlocoRepository";
import { GetBlocosByNucleoQuery } from "./GetBlocosByNucleoQuery";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class GetBlocosByNucleoHandler {
  constructor(private readonly blocoRepository: IBlocoRepository) {}

  async execute(query: GetBlocosByNucleoQuery): Promise<any[]> {
    const { nucleoId, userId, parentId } = query;

    if (!userId) throw new Error("Usuário não autenticado");

    const nucleoCheck = await pool.query(
      `SELECT id FROM nucleos WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [nucleoId, userId],
    );

    if (nucleoCheck.rows.length === 0) {
      throw new Error("Núcleo não encontrado ou sem permissão");
    }

    let blocos;
    if (parentId !== undefined && parentId !== null) {
      // Buscar filhos de um parent específico
      blocos = await this.blocoRepository.findByParentId(parentId, nucleoId);
    } else if (parentId === null) {
      // Buscar apenas raízes
      blocos = await this.blocoRepository.findRootBlocos(nucleoId);
    } else {
      // Comportamento original: todos os blocos
      blocos = await this.blocoRepository.findByNucleoId(nucleoId);
    }

    return blocos.map((b) => ({
      id: b.id,
      nucleoId: b.nucleoId,
      tipo: b.tipo,
      titulo: b.titulo,
      posicao: b.posicao,
      configuracoes: b.configuracoes,
      parentId: b.parentId,
      path: b.path,
      depth: b.depth,
      isCanvas: b.isCanvas,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
      deletedAt: b.deletedAt?.toISOString() || null,
    }));
  }
}
