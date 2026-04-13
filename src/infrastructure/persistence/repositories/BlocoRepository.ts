// infrastructure/persistence/repositories/BlocoRepository.ts
import { pool } from "../db/connection";
import { Bloco, BlocoProps } from "../../../domain/entities/Bloco";
import {
  BlocoCalculo,
  BlocoCalculoProps,
} from "../../../domain/entities/BlocoCalculo";
import { IBlocoRepository } from "../../../domain/repositories/IBlocoRepository";
import { TipoBloco } from "../../../domain/value-objects/TipoBloco";

export class BlocoRepository implements IBlocoRepository {
  async save(bloco: Bloco): Promise<void> {
    await pool.query(
      `INSERT INTO blocos (id, nucleo_id, tipo, titulo, posicao, configuracoes, created_at, updated_at, deleted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         tipo = EXCLUDED.tipo,
         titulo = EXCLUDED.titulo,
         posicao = EXCLUDED.posicao,
         configuracoes = EXCLUDED.configuracoes,
         updated_at = EXCLUDED.updated_at,
         deleted_at = EXCLUDED.deleted_at`,
      [
        bloco.id,
        bloco.nucleoId,
        bloco.tipo,
        bloco.titulo,
        bloco.posicao,
        JSON.stringify(bloco.configuracoes),
        bloco.createdAt,
        bloco.updatedAt,
        bloco.deletedAt,
      ],
    );
  }

  async findById(id: string, nucleoId: string): Promise<Bloco | null> {
    const result = await pool.query(
      `SELECT * FROM blocos WHERE id = $1 AND nucleo_id = $2 AND deleted_at IS NULL`,
      [id, nucleoId],
    );
    if (result.rows.length === 0) return null;
    return this.mapToEntity(result.rows[0]);
  }

  async findByNucleoId(nucleoId: string): Promise<Bloco[]> {
    const result = await pool.query(
      `SELECT * FROM blocos WHERE nucleo_id = $1 AND deleted_at IS NULL ORDER BY posicao ASC`,
      [nucleoId],
    );
    return result.rows.map((row: any) => this.mapToEntity(row));
  }

  async update(bloco: Bloco): Promise<void> {
    await pool.query(
      `UPDATE blocos 
       SET tipo = $1, titulo = $2, posicao = $3, configuracoes = $4, updated_at = $5, deleted_at = $6
       WHERE id = $7 AND nucleo_id = $8`,
      [
        bloco.tipo,
        bloco.titulo,
        bloco.posicao,
        JSON.stringify(bloco.configuracoes),
        bloco.updatedAt,
        bloco.deletedAt,
        bloco.id,
        bloco.nucleoId,
      ],
    );
  }

  async delete(id: string): Promise<void> {
    await pool.query(
      `UPDATE blocos SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
  }

  async updatePosition(
    id: string,
    posicao: number,
    nucleoId: string,
  ): Promise<void> {
    await pool.query(
      `UPDATE blocos SET posicao = $1, updated_at = NOW() 
       WHERE id = $2 AND nucleo_id = $3 AND deleted_at IS NULL`,
      [posicao, id, nucleoId],
    );
  }

  async saveCalculo(calculo: BlocoCalculo): Promise<void> {
    await pool.query(
      `INSERT INTO bloco_calculos (id, bloco_id, tipo_operacao, campo, agrupar_por, config, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (bloco_id) DO UPDATE SET
         tipo_operacao = EXCLUDED.tipo_operacao,
         campo = EXCLUDED.campo,
         agrupar_por = EXCLUDED.agrupar_por,
         config = EXCLUDED.config`,
      [
        calculo.id,
        calculo.blocoId,
        calculo.tipoOperacao,
        calculo.campo,
        calculo.agruparPor,
        JSON.stringify(calculo.config),
        calculo.createdAt,
      ],
    );
  }

  async findCalculoByBlocoId(blocoId: string): Promise<BlocoCalculo | null> {
    const result = await pool.query(
      `SELECT * FROM bloco_calculos WHERE bloco_id = $1`,
      [blocoId],
    );
    if (result.rows.length === 0) return null;
    return this.mapToCalculoEntity(result.rows[0]);
  }

  async deleteCalculo(blocoId: string): Promise<void> {
    await pool.query(`DELETE FROM bloco_calculos WHERE bloco_id = $1`, [
      blocoId,
    ]);
  }

  private mapToEntity(row: any): Bloco {
    return Bloco.reconstitute({
      id: row.id,
      nucleoId: row.nucleo_id,
      tipo: row.tipo as TipoBloco,
      titulo: row.titulo,
      posicao: row.posicao,
      configuracoes:
        typeof row.configuracoes === "string"
          ? JSON.parse(row.configuracoes)
          : row.configuracoes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
    });
  }

  private mapToCalculoEntity(row: any): BlocoCalculo {
    return BlocoCalculo.create({
      id: row.id,
      blocoId: row.bloco_id,
      tipoOperacao: row.tipo_operacao,
      campo: row.campo,
      agruparPor: row.agrupar_por,
      config:
        typeof row.config === "string" ? JSON.parse(row.config) : row.config,
      createdAt: new Date(row.created_at),
    });
  }
}
