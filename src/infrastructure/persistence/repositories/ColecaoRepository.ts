import { pool } from "../db/connection";
import { Colecao } from "../../../domain/entities/Colecao";
import { Campo, TipoCampo } from "../../../domain/entities/Campo";
import { Item } from "../../../domain/entities/Item";
import { ItemValor } from "../../../domain/entities/ItemValor";
import { IColecaoRepository } from "../../../domain/repositories/IColecaoRepository";

export class ColecaoRepository implements IColecaoRepository {
  //  COLEÇÃO
  async saveColecao(colecao: Colecao): Promise<void> {
    await pool.query(
      `INSERT INTO colecoes (id, bloco_id, nome, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         nome = EXCLUDED.nome,
         updated_at = EXCLUDED.updated_at`,
      [
        colecao.id,
        colecao.blocoId,
        colecao.nome,
        colecao.createdAt,
        colecao.updatedAt,
      ],
    );
  }

  async findColecaoById(id: string): Promise<Colecao | null> {
    const result = await pool.query(`SELECT * FROM colecoes WHERE id = $1`, [
      id,
    ]);
    if (result.rows.length === 0) return null;
    return this.mapToColecaoEntity(result.rows[0]);
  }

  async findAllColecoesByBlocoId(blocoId: string): Promise<Colecao[]> {
    const result = await pool.query(
      `SELECT * FROM colecoes WHERE bloco_id = $1 ORDER BY created_at ASC`,
      [blocoId],
    );
    return result.rows.map((row) => this.mapToColecaoEntity(row));
  }

  async updateColecao(colecao: Colecao): Promise<void> {
    await pool.query(
      `UPDATE colecoes SET nome = $1, updated_at = $2 WHERE id = $3`,
      [colecao.nome, colecao.updatedAt, colecao.id],
    );
  }

  async deleteColecao(id: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Buscar todos os itens da coleção
      const items = await client.query(
        `SELECT id FROM itens WHERE colecao_id = $1`,
        [id],
      );

      // Deletar valores dos itens
      for (const item of items.rows) {
        await client.query(`DELETE FROM item_valores WHERE item_id = $1`, [
          item.id,
        ]);
      }

      // Deletar itens
      await client.query(`DELETE FROM itens WHERE colecao_id = $1`, [id]);

      // Deletar campos
      await client.query(`DELETE FROM campos WHERE colecao_id = $1`, [id]);

      // Deletar coleção
      await client.query(`DELETE FROM colecoes WHERE id = $1`, [id]);

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  //  CAMPO
  async saveCampo(campo: Campo): Promise<void> {
    await pool.query(
      `INSERT INTO campos (id, colecao_id, nome, tipo_campo, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         nome = EXCLUDED.nome,
         tipo_campo = EXCLUDED.tipo_campo,
         updated_at = EXCLUDED.updated_at`,
      [
        campo.id,
        campo.colecaoId,
        campo.nome,
        campo.tipoCampo,
        campo.createdAt,
        campo.updatedAt,
      ],
    );
  }

  async findCampoById(id: string): Promise<Campo | null> {
    const result = await pool.query(`SELECT * FROM campos WHERE id = $1`, [id]);
    if (result.rows.length === 0) return null;
    return this.mapToCampoEntity(result.rows[0]);
  }

  async findAllCamposByColecaoId(colecaoId: string): Promise<Campo[]> {
    const result = await pool.query(
      `SELECT * FROM campos WHERE colecao_id = $1 ORDER BY created_at ASC`,
      [colecaoId],
    );
    return result.rows.map((row) => this.mapToCampoEntity(row));
  }

  async updateCampo(campo: Campo): Promise<void> {
    await pool.query(
      `UPDATE campos SET nome = $1, tipo_campo = $2, updated_at = $3 WHERE id = $4`,
      [campo.nome, campo.tipoCampo, campo.updatedAt, campo.id],
    );
  }

  async deleteCampo(id: string): Promise<void> {
    await pool.query(`DELETE FROM campos WHERE id = $1`, [id]);
  }

  //  ITEM
  async saveItem(item: Item): Promise<void> {
    await pool.query(
      `INSERT INTO itens (id, colecao_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET
         updated_at = EXCLUDED.updated_at`,
      [item.id, item.colecaoId, item.createdAt, item.updatedAt],
    );
  }

  async findItemById(id: string): Promise<Item | null> {
    const result = await pool.query(`SELECT * FROM itens WHERE id = $1`, [id]);
    if (result.rows.length === 0) return null;
    return this.mapToItemEntity(result.rows[0]);
  }

  async findAllItemsByColecaoId(colecaoId: string): Promise<Item[]> {
    const result = await pool.query(
      `SELECT * FROM itens WHERE colecao_id = $1 ORDER BY created_at ASC`,
      [colecaoId],
    );
    return result.rows.map((row) => this.mapToItemEntity(row));
  }

  async updateItem(item: Item): Promise<void> {
    await pool.query(`UPDATE itens SET updated_at = $1 WHERE id = $2`, [
      item.updatedAt,
      item.id,
    ]);
  }

  async deleteItem(id: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(`DELETE FROM item_valores WHERE item_id = $1`, [id]);
      await client.query(`DELETE FROM itens WHERE id = $1`, [id]);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  //  ITEM VALOR
  async saveItemValor(itemValor: ItemValor): Promise<void> {
    await pool.query(
      `INSERT INTO item_valores (id, item_id, campo_id, valor_texto, valor_numerico, valor_data, valor_booleano)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         valor_texto = EXCLUDED.valor_texto,
         valor_numerico = EXCLUDED.valor_numerico,
         valor_data = EXCLUDED.valor_data,
         valor_booleano = EXCLUDED.valor_booleano`,
      [
        itemValor.id,
        itemValor.itemId,
        itemValor.campoId,
        itemValor.valorTexto,
        itemValor.valorNumerico,
        itemValor.valorData,
        itemValor.valorBooleano,
      ],
    );
  }

  async findItemValorByItemAndCampo(
    itemId: string,
    campoId: string,
  ): Promise<ItemValor | null> {
    const result = await pool.query(
      `SELECT * FROM item_valores WHERE item_id = $1 AND campo_id = $2`,
      [itemId, campoId],
    );
    if (result.rows.length === 0) return null;
    return this.mapToItemValorEntity(result.rows[0]);
  }

  async findAllItemValoresByItemId(itemId: string): Promise<ItemValor[]> {
    const result = await pool.query(
      `SELECT * FROM item_valores WHERE item_id = $1`,
      [itemId],
    );
    return result.rows.map((row) => this.mapToItemValorEntity(row));
  }

  async updateItemValor(itemValor: ItemValor): Promise<void> {
    await pool.query(
      `UPDATE item_valores 
       SET valor_texto = $1, valor_numerico = $2, valor_data = $3, valor_booleano = $4
       WHERE id = $5`,
      [
        itemValor.valorTexto,
        itemValor.valorNumerico,
        itemValor.valorData,
        itemValor.valorBooleano,
        itemValor.id,
      ],
    );
  }

  async deleteItemValor(id: string): Promise<void> {
    await pool.query(`DELETE FROM item_valores WHERE id = $1`, [id]);
  }

  async deleteItemValoresByItemId(itemId: string): Promise<void> {
    await pool.query(`DELETE FROM item_valores WHERE item_id = $1`, [itemId]);
  }

  //  MAPPERS
  private mapToColecaoEntity(row: any): Colecao {
    return Colecao.reconstitute({
      id: row.id,
      blocoId: row.bloco_id,
      nome: row.nome,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  private mapToCampoEntity(row: any): Campo {
    return Campo.reconstitute({
      id: row.id,
      colecaoId: row.colecao_id,
      nome: row.nome,
      tipoCampo: row.tipo_campo as TipoCampo,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  private mapToItemEntity(row: any): Item {
    return Item.reconstitute({
      id: row.id,
      colecaoId: row.colecao_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  private mapToItemValorEntity(row: any): ItemValor {
    return ItemValor.reconstitute({
      id: row.id,
      itemId: row.item_id,
      campoId: row.campo_id,
      valorTexto: row.valor_texto,
      valorNumerico: row.valor_numerico,
      valorData: row.valor_data ? new Date(row.valor_data) : null,
      valorBooleano: row.valor_booleano,
    });
  }
}
