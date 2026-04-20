// infrastructure/persistence/repositories/TimerRepository.ts
import { pool, PoolClient } from "../db/connection";
import { Timer } from "../../../domain/entities/Timer";
import { randomUUID } from "crypto";

export class TimerRepository {
  async create(timer: Timer): Promise<Timer> {
    return this.createWithClient(pool, timer);
  }

  async createWithClient(
    client: PoolClient | typeof pool,
    timer: Timer,
  ): Promise<Timer> {
    const id = timer.id || randomUUID();
    await client.query(
      `INSERT INTO timers (id, nucleo_id, titulo, inicio, duracao_segundos, modo, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [
        id,
        timer.nucleoId,
        timer.titulo,
        timer.inicio,
        timer.duracaoSegundos,
        timer.modo,
      ],
    );
    const result = await client.query(`SELECT * FROM timers WHERE id = $1`, [
      id,
    ]);
    return this.mapToEntity(result.rows[0]);
  }

  async findById(id: string): Promise<Timer | null> {
    const result = await pool.query(`SELECT * FROM timers WHERE id = $1`, [id]);
    if (result.rows.length === 0) return null;
    return this.mapToEntity(result.rows[0]);
  }

  async findActiveByNucleoId(nucleoId: string): Promise<Timer | null> {
    const result = await pool.query(
      `SELECT * FROM timers WHERE nucleo_id = $1 AND fim IS NULL`,
      [nucleoId],
    );
    if (result.rows.length === 0) return null;
    return this.mapToEntity(result.rows[0]);
  }

  async findByNucleoId(nucleoId: string, userId?: string): Promise<Timer[]> {
    if (userId) {
      // Com verificação de permissão
      const result = await pool.query(
        `SELECT t.* FROM timers t
         JOIN nucleos n ON n.id = t.nucleo_id
         WHERE t.nucleo_id = $1 AND n.user_id = $2
         ORDER BY t.created_at DESC`,
        [nucleoId, userId],
      );
      return result.rows.map((row) => this.mapToEntity(row));
    }

    // Sem verificação de permissão (uso interno)
    const result = await pool.query(
      `SELECT * FROM timers WHERE nucleo_id = $1 ORDER BY created_at DESC`,
      [nucleoId],
    );
    return result.rows.map((row) => this.mapToEntity(row));
  }

  async update(timer: Timer): Promise<Timer> {
    await pool.query(
      `UPDATE timers SET titulo = $1, fim = $2, duracao_segundos = $3, updated_at = NOW() WHERE id = $4`,
      [timer.titulo, timer.fim, timer.duracaoSegundos, timer.id],
    );
    return this.findById(timer.id) as Promise<Timer>;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM timers t
       USING nucleos n
       WHERE t.id = $1 AND t.nucleo_id = n.id AND n.user_id = $2
       RETURNING t.id`,
      [id, userId],
    );
    return result.rows.length > 0;
  }

  private mapToEntity(row: any): Timer {
    return Timer.reconstitute({
      id: row.id,
      nucleoId: row.nucleo_id,
      titulo: row.titulo,
      inicio: row.inicio,
      fim: row.fim,
      duracaoSegundos: row.duracao_segundos,
      modo: row.modo || "crescente",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}
