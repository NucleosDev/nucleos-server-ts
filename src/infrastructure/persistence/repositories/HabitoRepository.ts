import { pool } from "../db/connection";
import { Habito, FrequenciaHabito } from "../../../domain/entities/Habito";
import { HabitoRegistro } from "../../../domain/entities/HabitoRegistro";
import { IHabitoRepository } from "../../../domain/repositories/IHabitoRepository";

export class HabitoRepository implements IHabitoRepository {
  // crud habitos

  async save(habito: Habito): Promise<void> {
    await pool.query(
      `INSERT INTO habitos (id, bloco_id, nome, frequencia, dias_semana, meta_vezes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         nome = EXCLUDED.nome,
         frequencia = EXCLUDED.frequencia,
         dias_semana = EXCLUDED.dias_semana,
         meta_vezes = EXCLUDED.meta_vezes,
         updated_at = EXCLUDED.updated_at`,
      [
        habito.id,
        habito.blocoId,
        habito.nome,
        habito.frequencia,
        habito.diasSemana ? JSON.stringify(habito.diasSemana) : null,
        habito.metaVezes,
        habito.createdAt,
        habito.updatedAt,
      ],
    );
  }

  async findById(id: string): Promise<Habito | null> {
    const result = await pool.query(
      `SELECT * FROM habitos WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    if (result.rows.length === 0) return null;
    return this.mapToEntity(result.rows[0]);
  }

  async findAllByBlocoId(blocoId: string): Promise<Habito[]> {
    const result = await pool.query(
      `SELECT * FROM habitos 
       WHERE bloco_id = $1 AND deleted_at IS NULL 
       ORDER BY created_at ASC`,
      [blocoId],
    );
    return result.rows.map((row) => this.mapToEntity(row));
  }

  async update(habito: Habito): Promise<void> {
    await pool.query(
      `UPDATE habitos 
       SET nome = $1, frequencia = $2, dias_semana = $3, meta_vezes = $4, updated_at = $5
       WHERE id = $6`,
      [
        habito.nome,
        habito.frequencia,
        habito.diasSemana ? JSON.stringify(habito.diasSemana) : null,
        habito.metaVezes,
        habito.updatedAt,
        habito.id,
      ],
    );
  }

  async delete(id: string): Promise<void> {
    await pool.query(`UPDATE habitos SET deleted_at = NOW() WHERE id = $1`, [
      id,
    ]);
  }

  //  REGISTROS 

  async saveRegistro(registro: HabitoRegistro): Promise<void> {
    await pool.query(
      `INSERT INTO habitos_registros (id, habito_id, data, vezes_completadas, created_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         vezes_completadas = EXCLUDED.vezes_completadas`,
      [
        registro.id,
        registro.habitoId,
        registro.data,
        registro.vezesCompletadas,
        registro.createdAt,
      ],
    );
  }

  async findRegistroByHabitoAndDate(
    habitoId: string,
    data: Date,
  ): Promise<HabitoRegistro | null> {
    const result = await pool.query(
      `SELECT * FROM habitos_registros 
       WHERE habito_id = $1 AND data = $2`,
      [habitoId, data],
    );
    if (result.rows.length === 0) return null;
    return this.mapToRegistroEntity(result.rows[0]);
  }

  async findRegistrosByHabito(
    habitoId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<HabitoRegistro[]> {
    let query = `SELECT * FROM habitos_registros WHERE habito_id = $1`;
    const params: any[] = [habitoId];

    if (startDate) {
      query += ` AND data >= $${params.length + 1}`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND data <= $${params.length + 1}`;
      params.push(endDate);
    }

    query += ` ORDER BY data ASC`;

    const result = await pool.query(query, params);
    return result.rows.map((row) => this.mapToRegistroEntity(row));
  }

  async getStreak(
    habitoId: string,
  ): Promise<{ atual: number; maximo: number }> {
    const registros = await this.findRegistrosByHabito(habitoId);

    let atual = 0;
    let maximo = 0;
    let streakAtual = 0;

    // Ordenar por data (mais antigo para mais novo)
    const sorted = [...registros].sort(
      (a, b) => a.data.getTime() - b.data.getTime(),
    );

    // Calcular streak
    let lastDate: Date | null = null;
    for (const registro of sorted) {
      if (lastDate === null) {
        streakAtual = 1;
      } else {
        const diffDays = Math.floor(
          (registro.data.getTime() - lastDate.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        if (diffDays === 1) {
          streakAtual++;
        } else if (diffDays > 1) {
          streakAtual = 1;
        }
      }

      atual = streakAtual;
      maximo = Math.max(maximo, streakAtual);
      lastDate = registro.data;
    }

    return { atual, maximo };
  }

  async isCompletoHoje(habitoId: string): Promise<boolean> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const registro = await this.findRegistroByHabitoAndDate(habitoId, hoje);
    return registro !== null;
  }

  //  MAPPERS 

  private mapToEntity(row: any): Habito {
    return Habito.reconstitute({
      id: row.id,
      blocoId: row.bloco_id,
      nome: row.nome,
      frequencia: row.frequencia as FrequenciaHabito,
      diasSemana: row.dias_semana ? JSON.parse(row.dias_semana) : null,
      metaVezes: row.meta_vezes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  private mapToRegistroEntity(row: any): HabitoRegistro {
    return HabitoRegistro.reconstitute({
      id: row.id,
      habitoId: row.habito_id,
      data: new Date(row.data),
      vezesCompletadas: row.vezes_completadas,
      createdAt: new Date(row.created_at),
    });
  }
}
