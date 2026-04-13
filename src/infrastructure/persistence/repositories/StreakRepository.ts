// infrastructure/persistence/repositories/StreakRepository.ts
import { BaseRepository } from "./BaseRepository";
import { IStreakRepository } from "../../../domain/repositories/IStreakRepository";
import { Streak } from "../../../domain/entities/Streak";

export class StreakRepository
  extends BaseRepository<Streak>
  implements IStreakRepository
{
  protected getTableName(): string {
    return "streaks";
  }

  protected mapToEntity(row: any): Streak {
    return Streak.fromDatabase(row);
  }

  protected mapToDatabase(entity: Streak): any[] {
    // 🔥 Remove deletedAt (entidade não tem essa propriedade)
    return [
      entity.id,
      entity.userId,
      entity.nucleoId,
      entity.streakType,
      entity.currentStreak,
      entity.maxStreak,
      entity.lastActivityDate,
      entity.createdAt,
      entity.updatedAt,
    ];
  }

  // ========== MÉTODOS ESPECÍFICOS ==========

  async findByUserId(userId: string): Promise<Streak[]> {
    const result = await this.query(
      `SELECT * FROM streaks WHERE user_id = $1`,
      [userId],
    );
    return result.rows.map((row) => this.mapToEntity(row));
  }

  async findByUserAndType(
    userId: string,
    streakType: string,
    nucleoId?: string,
  ): Promise<Streak | null> {
    let sql = `SELECT * FROM streaks WHERE user_id = $1 AND streak_type = $2`;
    const params: any[] = [userId, streakType];
    if (nucleoId) {
      sql += ` AND nucleo_id = $3`;
      params.push(nucleoId);
    } else {
      sql += ` AND nucleo_id IS NULL`;
    }
    const result = await this.query(sql, params);
    return result.rows[0] ? this.mapToEntity(result.rows[0]) : null;
  }

  override async create(streak: Streak): Promise<Streak> {
    const values = this.mapToDatabase(streak);
    const columns = [
      "id",
      "user_id",
      "nucleo_id",
      "streak_type",
      "current_streak",
      "max_streak",
      "last_activity_date",
      "created_at",
      "updated_at",
    ];
    const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
    const sql = `INSERT INTO streaks (${columns.join(", ")}) VALUES (${placeholders}) RETURNING *`;
    const result = await this.query(sql, values);
    return this.mapToEntity(result.rows[0]);
  }

  async save(streak: Streak): Promise<Streak> {
    const values = [
      streak.currentStreak,
      streak.maxStreak,
      streak.lastActivityDate,
      streak.id,
    ];
    const sql = `
      UPDATE streaks
      SET current_streak = $1, max_streak = $2, last_activity_date = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;
    const result = await this.query(sql, values);
    return this.mapToEntity(result.rows[0]);
  }

  // ========== MÉTODOS OBRIGATÓRIOS DA BASE (com override) ==========

  override async findById(
    id: string,
    additionalConditions: string = "",
  ): Promise<Streak | null> {
    const sql = `SELECT * FROM streaks WHERE id = $1 ${additionalConditions}`;
    const result = await this.query(sql, [id]);
    return result.rows[0] ? this.mapToEntity(result.rows[0]) : null;
  }

  override async softDelete(id: string): Promise<boolean> {
    // streaks não tem soft delete, então faz hard delete ou lança erro
    return this.hardDelete(id);
  }
}
