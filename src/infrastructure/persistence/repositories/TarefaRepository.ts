import { pool } from "../db/connection";
import {
  Tarefa,
  PrioridadeTarefa,
  StatusTarefa,
} from "../../../domain/entities/Tarefa";
import { ITarefaRepository } from "../../../domain/repositories/ITarefaRepository";

export class TarefaRepository implements ITarefaRepository {
  async save(tarefa: Tarefa): Promise<void> {
    await pool.query(
      `INSERT INTO tarefas (id, bloco_id, titulo, descricao, prioridade, status, data_vencimento, concluida_em, posicao, created_at, updated_at, deleted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (id) DO UPDATE SET
         titulo = EXCLUDED.titulo,
         descricao = EXCLUDED.descricao,
         prioridade = EXCLUDED.prioridade,
         status = EXCLUDED.status,
         data_vencimento = EXCLUDED.data_vencimento,
         concluida_em = EXCLUDED.concluida_em,
         posicao = EXCLUDED.posicao,
         updated_at = EXCLUDED.updated_at,
         deleted_at = EXCLUDED.deleted_at`,
      [
        tarefa.id,
        tarefa.blocoId,
        tarefa.titulo,
        tarefa.descricao,
        tarefa.prioridade,
        tarefa.status,
        tarefa.dataVencimento,
        tarefa.concluidaEm,
        tarefa.posicao,
        tarefa.createdAt,
        tarefa.updatedAt,
        tarefa.deletedAt,
      ],
    );
  }

  async findById(id: string): Promise<Tarefa | null> {
    const result = await pool.query(
      `SELECT * FROM tarefas WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    if (result.rows.length === 0) return null;
    return this.mapToEntity(result.rows[0]);
  }

  async findByBlocoId(blocoId: string): Promise<Tarefa[]> {
    const result = await pool.query(
      `SELECT * FROM tarefas WHERE bloco_id = $1 AND deleted_at IS NULL ORDER BY posicao ASC`,
      [blocoId],
    );
    return result.rows.map((row) => this.mapToEntity(row));
  }

  async update(tarefa: Tarefa): Promise<void> {
    await pool.query(
      `UPDATE tarefas 
       SET titulo = $1, descricao = $2, prioridade = $3, status = $4, 
           data_vencimento = $5, concluida_em = $6, posicao = $7, updated_at = $8
       WHERE id = $9`,
      [
        tarefa.titulo,
        tarefa.descricao,
        tarefa.prioridade,
        tarefa.status,
        tarefa.dataVencimento,
        tarefa.concluidaEm,
        tarefa.posicao,
        tarefa.updatedAt,
        tarefa.id,
      ],
    );
  }

  async delete(id: string): Promise<void> {
    await pool.query(
      `UPDATE tarefas SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
  }

  async getNextPosition(blocoId: string): Promise<number> {
    const result = await pool.query(
      `SELECT COALESCE(MAX(posicao), -1) + 1 as next_pos FROM tarefas WHERE bloco_id = $1 AND deleted_at IS NULL`,
      [blocoId],
    );
    return parseInt(result.rows[0].next_pos) || 0;
  }

  private mapToEntity(row: any): Tarefa {
    return Tarefa.reconstitute({
      id: row.id,
      blocoId: row.bloco_id,
      titulo: row.titulo,
      descricao: row.descricao,
      prioridade: row.prioridade as PrioridadeTarefa,
      status: row.status as StatusTarefa,
      dataVencimento: row.data_vencimento,
      concluidaEm: row.concluida_em,
      posicao: row.posicao,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    });
  }
}
