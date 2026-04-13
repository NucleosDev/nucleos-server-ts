import { pool } from "../db/connection";
import { Lista, TipoLista } from "../../../domain/entities/Lista";
import { ItemLista } from "../../../domain/entities/ItemLista";
import { Categoria } from "../../../domain/entities/Categoria";
import { IListaRepository } from "../../../domain/repositories/IListaRepository";

export class ListaRepository implements IListaRepository {
  //  LISTA
  async saveLista(lista: Lista): Promise<void> {
    await pool.query(
      `INSERT INTO listas (id, bloco_id, nome, tipo_lista, created_at, updated_at, deleted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         nome = EXCLUDED.nome,
         tipo_lista = EXCLUDED.tipo_lista,
         updated_at = EXCLUDED.updated_at,
         deleted_at = EXCLUDED.deleted_at`,
      [
        lista.id,
        lista.blocoId,
        lista.nome,
        lista.tipoLista,
        lista.createdAt,
        lista.updatedAt,
        lista.deletedAt,
      ],
    );
  }

  async findListaById(id: string): Promise<Lista | null> {
    const result = await pool.query(
      `SELECT * FROM listas WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    if (result.rows.length === 0) return null;
    return this.mapToListaEntity(result.rows[0]);
  }

  async findListasByBlocoId(blocoId: string): Promise<Lista[]> {
    const result = await pool.query(
      `SELECT * FROM listas WHERE bloco_id = $1 AND deleted_at IS NULL ORDER BY created_at ASC`,
      [blocoId],
    );
    return result.rows.map((row) => this.mapToListaEntity(row));
  }

  async updateLista(lista: Lista): Promise<void> {
    await pool.query(
      `UPDATE listas SET nome = $1, tipo_lista = $2, updated_at = $3, deleted_at = $4 WHERE id = $5`,
      [lista.nome, lista.tipoLista, lista.updatedAt, lista.deletedAt, lista.id],
    );
  }

  async deleteLista(id: string): Promise<void> {
    await pool.query(`UPDATE listas SET deleted_at = NOW() WHERE id = $1`, [
      id,
    ]);
  }

  //  ITEM
  async saveItem(item: ItemLista): Promise<void> {
    await pool.query(
      `INSERT INTO itens_lista (id, lista_id, categoria_id, nome, quantidade, valor_unitario, checked, created_at, updated_at, deleted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         categoria_id = EXCLUDED.categoria_id,
         nome = EXCLUDED.nome,
         quantidade = EXCLUDED.quantidade,
         valor_unitario = EXCLUDED.valor_unitario,
         checked = EXCLUDED.checked,
         updated_at = EXCLUDED.updated_at,
         deleted_at = EXCLUDED.deleted_at`,
      [
        item.id,
        item.listaId,
        item.categoriaId,
        item.nome,
        item.quantidade,
        item.valorUnitario,
        item.checked,
        item.createdAt,
        item.updatedAt,
        item.deletedAt,
      ],
    );
  }

  async findItemById(id: string): Promise<ItemLista | null> {
    const result = await pool.query(
      `SELECT * FROM itens_lista WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    if (result.rows.length === 0) return null;
    return this.mapToItemEntity(result.rows[0]);
  }

  async findItemsByListaId(listaId: string): Promise<ItemLista[]> {
    const result = await pool.query(
      `SELECT * FROM itens_lista WHERE lista_id = $1 AND deleted_at IS NULL ORDER BY created_at ASC`,
      [listaId],
    );
    return result.rows.map((row) => this.mapToItemEntity(row));
  }

  async updateItem(item: ItemLista): Promise<void> {
    await pool.query(
      `UPDATE itens_lista 
       SET categoria_id = $1, nome = $2, quantidade = $3, valor_unitario = $4, 
           checked = $5, updated_at = $6, deleted_at = $7
       WHERE id = $8`,
      [
        item.categoriaId,
        item.nome,
        item.quantidade,
        item.valorUnitario,
        item.checked,
        item.updatedAt,
        item.deletedAt,
        item.id,
      ],
    );
  }

  async deleteItem(id: string): Promise<void> {
    await pool.query(
      `UPDATE itens_lista SET deleted_at = NOW() WHERE id = $1`,
      [id],
    );
  }

  async bulkUpdateItems(items: ItemLista[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const item of items) {
        await client.query(
          `UPDATE itens_lista 
           SET checked = $1, updated_at = NOW()
           WHERE id = $2 AND deleted_at IS NULL`,
          [item.checked, item.id],
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

  //  CATEGORIA
  async saveCategoria(categoria: Categoria): Promise<void> {
    await pool.query(
      `INSERT INTO categorias (id, lista_id, nome, cor, created_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         nome = EXCLUDED.nome,
         cor = EXCLUDED.cor`,
      [
        categoria.id,
        categoria.listaId,
        categoria.nome,
        categoria.cor,
        categoria.createdAt,
      ],
    );
  }

  async findCategoriaById(id: string): Promise<Categoria | null> {
    const result = await pool.query(`SELECT * FROM categorias WHERE id = $1`, [
      id,
    ]);
    if (result.rows.length === 0) return null;
    return this.mapToCategoriaEntity(result.rows[0]);
  }

  async findCategoriasByListaId(listaId: string): Promise<Categoria[]> {
    const result = await pool.query(
      `SELECT * FROM categorias WHERE lista_id = $1 ORDER BY nome ASC`,
      [listaId],
    );
    return result.rows.map((row) => this.mapToCategoriaEntity(row));
  }

  async updateCategoria(categoria: Categoria): Promise<void> {
    await pool.query(
      `UPDATE categorias SET nome = $1, cor = $2 WHERE id = $3`,
      [categoria.nome, categoria.cor, categoria.id],
    );
  }

  async deleteCategoria(id: string): Promise<void> {
    // Primeiro, remover a referência dos itens
    await pool.query(
      `UPDATE itens_lista SET categoria_id = NULL WHERE categoria_id = $1`,
      [id],
    );
    // Depois, deletar a categoria
    await pool.query(`DELETE FROM categorias WHERE id = $1`, [id]);
  }

  //  MAPPERS
  private mapToListaEntity(row: any): Lista {
    return Lista.reconstitute({
      id: row.id,
      blocoId: row.bloco_id,
      nome: row.nome,
      tipoLista: row.tipo_lista as TipoLista,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
    });
  }

  private mapToItemEntity(row: any): ItemLista {
    return ItemLista.reconstitute({
      id: row.id,
      listaId: row.lista_id,
      categoriaId: row.categoria_id,
      nome: row.nome,
      quantidade: parseFloat(row.quantidade) || 1,
      valorUnitario: row.valor_unitario ? parseFloat(row.valor_unitario) : null,
      checked: row.checked,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
    });
  }

  private mapToCategoriaEntity(row: any): Categoria {
    return Categoria.reconstitute({
      id: row.id,
      listaId: row.lista_id,
      nome: row.nome,
      cor: row.cor,
      createdAt: new Date(row.created_at),
    });
  }
}
