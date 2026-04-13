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

  async findById(
    id: string,
    nucleoId: string,
  ): Promise<CalendarioEvento | null> {
    const result = await pool.query(
      `SELECT * FROM calendario_eventos WHERE id = $1 AND nucleo_id = $2`,
      [id, nucleoId],
    );
    if (result.rows.length === 0) return null;
    return CalendarioEvento.reconstitute(result.rows[0]);
  }

  async findAllByNucleoId(
    nucleoId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<CalendarioEvento[]> {
    let query = `SELECT * FROM calendario_eventos WHERE nucleo_id = $1`;
    const params: any[] = [nucleoId];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND data_evento >= $${paramIndex++}`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND data_evento <= $${paramIndex++}`;
      params.push(endDate);
    }
    query += ` ORDER BY data_evento ASC`;

    const result = await pool.query(query, params);
    return result.rows.map((row) => CalendarioEvento.reconstitute(row));
  }

  async update(evento: CalendarioEvento): Promise<void> {
    await this.save(evento); // save já faz upsert
  }

  async delete(id: string, nucleoId: string): Promise<void> {
    await pool.query(
      `DELETE FROM calendario_eventos WHERE id = $1 AND nucleo_id = $2`,
      [id, nucleoId],
    );
  }
}
