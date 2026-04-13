import { pool } from "../db/connection";
import { CalendarioEvento } from "../../../domain/entities/CalendarioEvento";
import { ICalendarioRepository } from "../../../domain/repositories/ICalendarioRepository";

export class CalendarioRepository implements ICalendarioRepository {
  async save(evento: CalendarioEvento): Promise<void> {
    await pool.query(
      `INSERT INTO calendario_eventos (id, nucleo_id, titulo, descricao, data_evento, duracao_minutos, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         titulo = EXCLUDED.titulo,
         descricao = EXCLUDED.descricao,
         data_evento = EXCLUDED.data_evento,
         duracao_minutos = EXCLUDED.duracao_minutos,
         updated_at = EXCLUDED.updated_at`,
      [
        evento.id,
        evento.nucleoId,
        evento.titulo,
        evento.descricao,
        evento.dataEvento,
        evento.duracaoMinutos,
        evento.createdAt,
        evento.updatedAt,
      ],
    );
  }

  async findById(id: string): Promise<CalendarioEvento | null> {
    const result = await pool.query(
      `SELECT * FROM calendario_eventos WHERE id = $1`,
      [id],
    );
    if (result.rows.length === 0) return null;
    return this.mapToEntity(result.rows[0]);
  }

  async findAllByNucleoId(nucleoId: string): Promise<CalendarioEvento[]> {
    const result = await pool.query(
      `SELECT * FROM calendario_eventos 
       WHERE nucleo_id = $1 
       ORDER BY data_evento ASC`,
      [nucleoId],
    );
    return result.rows.map((row) => this.mapToEntity(row));
  }

  async findAllByDateRange(
    nucleoId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CalendarioEvento[]> {
    const result = await pool.query(
      `SELECT * FROM calendario_eventos 
       WHERE nucleo_id = $1 
         AND data_evento >= $2 
         AND data_evento <= $3
       ORDER BY data_evento ASC`,
      [nucleoId, startDate, endDate],
    );
    return result.rows.map((row) => this.mapToEntity(row));
  }

  async update(evento: CalendarioEvento): Promise<void> {
    await pool.query(
      `UPDATE calendario_eventos 
       SET titulo = $1, descricao = $2, data_evento = $3, duracao_minutos = $4, updated_at = $5
       WHERE id = $6`,
      [
        evento.titulo,
        evento.descricao,
        evento.dataEvento,
        evento.duracaoMinutos,
        evento.updatedAt,
        evento.id,
      ],
    );
  }

  async delete(id: string): Promise<void> {
    await pool.query(`DELETE FROM calendario_eventos WHERE id = $1`, [id]);
  }

  private mapToEntity(row: any): CalendarioEvento {
    return CalendarioEvento.reconstitute({
      id: row.id,
      nucleoId: row.nucleo_id,
      titulo: row.titulo,
      descricao: row.descricao,
      dataEvento: new Date(row.data_evento),
      duracaoMinutos: row.duracao_minutos,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}
