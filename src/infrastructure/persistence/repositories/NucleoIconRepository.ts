import { pool } from "../db/connection";

export interface NucleoIconRow {
  id: string;
  name: string;
  icon_url: string | null;
  created_at: Date;
}

export class NucleoIconRepository {
  async findByName(name: string): Promise<NucleoIconRow | null> {
    const result = await pool.query(
      `SELECT id, name, icon_url, created_at FROM nucleo_icons WHERE name = $1`,
      [name],
    );
    return result.rows[0] || null;
  }

  async findById(id: string): Promise<NucleoIconRow | null> {
    const result = await pool.query(
      `SELECT id, name, icon_url, created_at FROM nucleo_icons WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async findAll(): Promise<NucleoIconRow[]> {
    const result = await pool.query(
      `SELECT id, name, icon_url, created_at FROM nucleo_icons ORDER BY name`,
    );
    return result.rows;
  }
}
