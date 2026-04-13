// infrastructure/persistence/repositories/BaseRepository.ts
import { pool, PoolClient } from "../db/connection";
import { QueryResult } from "pg";

export abstract class BaseRepository<T> {
  protected abstract getTableName(): string;
  protected abstract mapToEntity(row: any): T;
  protected abstract mapToDatabase(entity: T): any[];

  //  QUERY METHODS
  protected async query(sql: string, params?: any[]): Promise<QueryResult> {
    return pool.query(sql, params);
  }

  protected async queryWithClient(
    client: PoolClient,
    sql: string,
    params?: any[],
  ): Promise<QueryResult> {
    return client.query(sql, params);
  }

  //  CRUD OPERATIONS
  async findById(
    id: string,
    additionalConditions: string = "",
  ): Promise<T | null> {
    const sql = `SELECT * FROM ${this.getTableName()} WHERE id = $1 ${additionalConditions}`;
    const result = await this.query(sql, [id]);
    return result.rows.length > 0 ? this.mapToEntity(result.rows[0]) : null;
  }

  async findAll(where?: Record<string, any>, orderBy?: string): Promise<T[]> {
    let sql = `SELECT * FROM ${this.getTableName()}`;
    const values: any[] = [];

    if (where && Object.keys(where).length > 0) {
      const conditions: string[] = [];
      let i = 1;
      for (const [key, value] of Object.entries(where)) {
        conditions.push(`${key} = $${i++}`);
        values.push(value);
      }
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    if (orderBy) {
      sql += ` ORDER BY ${orderBy}`;
    }

    const result = await this.query(sql, values);
    return result.rows.map((row) => this.mapToEntity(row));
  }

  async create(entity: T): Promise<T> {
    const values = this.mapToDatabase(entity);
    const columns = ["id", "created_at", "updated_at", "deleted_at"];

    const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
    const sql = `INSERT INTO ${this.getTableName()} (${columns.join(", ")}) VALUES (${placeholders}) RETURNING *`;

    const result = await this.query(sql, values);
    return this.mapToEntity(result.rows[0]);
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let i = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updates.push(`${key} = $${i++}`);
        values.push(value);
      }
    }

    if (updates.length === 0) return null;

    values.push(id);
    updates.push(`updated_at = NOW()`);

    const sql = `UPDATE ${this.getTableName()} SET ${updates.join(", ")} WHERE id = $${i} RETURNING *`;
    const result = await this.query(sql, values);

    return result.rows.length > 0 ? this.mapToEntity(result.rows[0]) : null;
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.query(
      `UPDATE ${this.getTableName()} SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
      [id],
    );
    return result.rows.length > 0;
  }

  async hardDelete(id: string): Promise<boolean> {
    const result = await this.query(
      `DELETE FROM ${this.getTableName()} WHERE id = $1 RETURNING id`,
      [id],
    );
    return result.rows.length > 0;
  }

  async count(where?: Record<string, any>): Promise<number> {
    let sql = `SELECT COUNT(*) as total FROM ${this.getTableName()}`;
    const values: any[] = [];

    if (where && Object.keys(where).length > 0) {
      const conditions: string[] = [];
      let i = 1;
      for (const [key, value] of Object.entries(where)) {
        conditions.push(`${key} = $${i++}`);
        values.push(value);
      }
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    const result = await this.query(sql, values);
    return parseInt(result.rows[0].total);
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.query(
      `SELECT 1 FROM ${this.getTableName()} WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [id],
    );
    return result.rows.length > 0;
  }

  //  BATCH OPERATIONS
  async batchCreate(entities: T[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const entity of entities) {
        const values = this.mapToDatabase(entity);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
        await client.query(
          `INSERT INTO ${this.getTableName()} (id, created_at, updated_at, deleted_at) VALUES (${placeholders})`,
          values,
        );
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async batchDelete(ids: string[]): Promise<number> {
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ");
    const result = await this.query(
      `UPDATE ${this.getTableName()} SET deleted_at = NOW(), updated_at = NOW() WHERE id IN (${placeholders}) AND deleted_at IS NULL RETURNING id`,
      ids,
    );
    return result.rows.length;
  }

  //  PAGINATION
  async paginate(
    page: number = 1,
    limit: number = 10,
    where?: Record<string, any>,
    orderBy: string = "created_at DESC",
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    let sql = `SELECT * FROM ${this.getTableName()}`;
    const values: any[] = [];
    let whereClause = "";

    if (where && Object.keys(where).length > 0) {
      const conditions: string[] = [];
      let i = 1;
      for (const [key, value] of Object.entries(where)) {
        conditions.push(`${key} = $${i++}`);
        values.push(value);
      }
      whereClause = ` WHERE ${conditions.join(" AND ")}`;
      sql += whereClause;
    }

    sql += ` ORDER BY ${orderBy} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const result = await this.query(sql, values);
    const total = await this.count(where);

    return {
      data: result.rows.map((row) => this.mapToEntity(row)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  //  TRANSACTION METHODS
  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
