import { pool } from "../db/connection";
import { TreinoTemplate } from "../../../domain/entities/TreinoTemplate";
import { TreinoExercicio } from "../../../domain/entities/TreinoExercicio";
import { IExerciciosRepository } from "../../../domain/repositories/IExerciciosRepository";

export class ExerciciosRepository implements IExerciciosRepository {
  // ── TreinoTemplate ────────────────────────────────────────────────────

  async saveTemplate(template: TreinoTemplate): Promise<void> {
    await pool.query(
      `INSERT INTO treino_templates (id, bloco_id, nome, descricao, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         nome = EXCLUDED.nome,
         descricao = EXCLUDED.descricao,
         updated_at = EXCLUDED.updated_at`,
      [
        template.id,
        template.blocoId,
        template.nome,
        template.descricao ?? null,
        template.createdAt,
        template.updatedAt,
      ],
    );
  }

  async findTemplateById(id: string): Promise<TreinoTemplate | null> {
    const result = await pool.query(
      `SELECT * FROM treino_templates WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    if (result.rows.length === 0) return null;
    return this.mapTemplate(result.rows[0]);
  }

  async findTemplatesByBlocoId(blocoId: string): Promise<TreinoTemplate[]> {
    const result = await pool.query(
      `SELECT * FROM treino_templates
       WHERE bloco_id = $1 AND deleted_at IS NULL
       ORDER BY created_at ASC`,
      [blocoId],
    );
    return result.rows.map((row) => this.mapTemplate(row));
  }

  async updateTemplate(template: TreinoTemplate): Promise<void> {
    await pool.query(
      `UPDATE treino_templates
       SET nome = $1, descricao = $2, updated_at = $3
       WHERE id = $4 AND deleted_at IS NULL`,
      [template.nome, template.descricao ?? null, template.updatedAt, template.id],
    );
  }

  async deleteTemplate(id: string): Promise<void> {
    await pool.query(
      `UPDATE treino_templates SET deleted_at = NOW() WHERE id = $1`,
      [id],
    );
  }

  // ── TreinoExercicio ───────────────────────────────────────────────────

  async saveExercicio(exercicio: TreinoExercicio): Promise<void> {
    await pool.query(
      `INSERT INTO treino_exercicios (id, template_id, nome, series, repeticoes, peso_kg, ordem, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        exercicio.id,
        exercicio.templateId,
        exercicio.nome,
        exercicio.series,
        exercicio.repeticoes,
        exercicio.pesoKg ?? null,
        exercicio.ordem,
        exercicio.createdAt,
      ],
    );
  }

  async findExerciciosByTemplateId(templateId: string): Promise<TreinoExercicio[]> {
    const result = await pool.query(
      `SELECT * FROM treino_exercicios WHERE template_id = $1 ORDER BY ordem ASC, created_at ASC`,
      [templateId],
    );
    return result.rows.map((row) => this.mapExercicio(row));
  }

  async deleteExercicio(id: string): Promise<void> {
    await pool.query(`DELETE FROM treino_exercicios WHERE id = $1`, [id]);
  }

  // ── Sessions count ────────────────────────────────────────────────────

  async countSessoesByTemplateId(templateId: string): Promise<number> {
    const result = await pool.query(
      `SELECT COUNT(*) FROM sessoes_treino WHERE template_id = $1 AND concluida = TRUE`,
      [templateId],
    );
    return parseInt(result.rows[0].count, 10);
  }

  // ── Mappers ───────────────────────────────────────────────────────────

  private mapTemplate(row: any): TreinoTemplate {
    return TreinoTemplate.reconstitute({
      id: row.id,
      blocoId: row.bloco_id,
      nome: row.nome,
      descricao: row.descricao ?? null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
    });
  }

  private mapExercicio(row: any): TreinoExercicio {
    return TreinoExercicio.reconstitute({
      id: row.id,
      templateId: row.template_id,
      nome: row.nome,
      series: row.series,
      repeticoes: row.repeticoes,
      pesoKg: row.peso_kg ? parseFloat(row.peso_kg) : null,
      ordem: row.ordem,
      createdAt: new Date(row.created_at),
    });
  }
}
