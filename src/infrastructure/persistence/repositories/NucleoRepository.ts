import { pool } from "../db/connection";
import { Nucleo } from "../../../domain/entities/Nucleo";
import { INucleoRepository } from "../../../domain/repositories/INucleoRepository";

export class NucleoRepository implements INucleoRepository {
  async save(nucleo: Nucleo): Promise<void> {
    await pool.query(
      `INSERT INTO nucleos (id, user_id, nome, descricao, tipo, cor_destaque, imagem_capa, icon_id, created_at, updated_at, deleted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE SET
         nome = EXCLUDED.nome,
         descricao = EXCLUDED.descricao,
         tipo = EXCLUDED.tipo,
         cor_destaque = EXCLUDED.cor_destaque,
         imagem_capa = EXCLUDED.imagem_capa,
         icon_id = EXCLUDED.icon_id,
         updated_at = EXCLUDED.updated_at,
         deleted_at = EXCLUDED.deleted_at`,
      [
        nucleo.id,
        nucleo.userId,
        nucleo.nome,
        nucleo.descricao,
        nucleo.tipo,
        nucleo.corDestaque,
        nucleo.imagemCapa,
        nucleo.iconId,
        nucleo.createdAt,
        nucleo.updatedAt,
        nucleo.deletedAt,
      ],
    );
  }

  async findById(id: string, userId: string): Promise<Nucleo | null> {
    const result = await pool.query(
      `SELECT * FROM nucleos WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [id, userId],
    );
    if (result.rows.length === 0) return null;
    return this.mapToEntity(result.rows[0]);
  }

  async findAllByUserId(userId: string): Promise<Nucleo[]> {
    const result = await pool.query(
      `SELECT * FROM nucleos WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC`,
      [userId],
    );
    return result.rows.map((row) => this.mapToEntity(row));
  }

  async update(nucleo: Nucleo): Promise<void> {
    await pool.query(
      `UPDATE nucleos 
       SET nome = $1, descricao = $2, tipo = $3, cor_destaque = $4, 
           imagem_capa = $5, icon_id = $6, updated_at = $7, deleted_at = $8
       WHERE id = $9 AND user_id = $10`,
      [
        nucleo.nome,
        nucleo.descricao,
        nucleo.tipo,
        nucleo.corDestaque,
        nucleo.imagemCapa,
        nucleo.iconId,
        nucleo.updatedAt,
        nucleo.deletedAt,
        nucleo.id,
        nucleo.userId,
      ],
    );
  }

  async delete(id: string, userId: string): Promise<void> {
    await pool.query(
      `UPDATE nucleos SET deleted_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [id, userId],
    );
  }

  private mapToEntity(row: any): Nucleo {
    return Nucleo.reconstitute({
      id: row.id,
      userId: row.user_id,
      nome: row.nome,
      descricao: row.descricao,
      tipo: row.tipo,
      corDestaque: row.cor_destaque,
      imagemCapa: row.imagem_capa,
      iconId: row.icon_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
    });
  }
}
