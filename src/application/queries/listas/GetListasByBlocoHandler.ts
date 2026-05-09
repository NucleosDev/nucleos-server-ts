import { pool } from "../../../infrastructure/persistence/db/connection";
import { GetListasByBlocoQuery } from "./GetListasByBlocoQuery";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";
import {
  getCache,
  setCache,
  CacheKeys,
  TTL,
} from "../../../infrastructure/cache/redis.service";

export class GetListasByBlocoHandler {
  async execute(query: GetListasByBlocoQuery): Promise<any[]> {
    const { blocoId, userId } = query;

    const cacheKey = CacheKeys.listasByBloco(blocoId);
    const cached = await getCache<any[]>(cacheKey);
    if (cached) return cached;

    const blocoCheck = await pool.query(
      `SELECT n.user_id FROM blocos b
       JOIN nucleos n ON n.id = b.nucleo_id
       WHERE b.id = $1 AND b.deleted_at IS NULL`,
      [blocoId],
    );

    if (blocoCheck.rows.length === 0) throw new NotFoundException("Bloco", blocoId);
    if (blocoCheck.rows[0].user_id !== userId) {
      throw new ForbiddenException("Sem permissão para ver listas deste bloco");
    }

    const result = await pool.query(
      `SELECT l.id, l.bloco_id, l.nome, l.tipo_lista, l.created_at, l.updated_at
       FROM listas l
       WHERE l.bloco_id = $1 AND l.deleted_at IS NULL
       ORDER BY l.created_at ASC`,
      [blocoId],
    );

    const data = result.rows.map((row) => ({
      id: row.id,
      blocoId: row.bloco_id,
      nome: row.nome,
      tipoLista: row.tipo_lista,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    await setCache(cacheKey, data, TTL.DEFAULT);
    return data;
  }
}
