import { IColecaoRepository } from "../../../domain/repositories/IColecaoRepository";
import { UpdateItemCommand } from "./UpdateItemCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";
import { randomUUID } from "crypto";

export class UpdateItemHandler {
  constructor(private readonly colecaoRepository: IColecaoRepository) {}

  async execute(command: UpdateItemCommand): Promise<any> {
    const { id, userId, valores } = command;

    // Verificar permissão
    const check = await pool.query(
      `SELECT n.user_id FROM itens i
       JOIN colecoes c ON i.colecao_id = c.id
       JOIN blocos b ON b.id = c.bloco_id
       JOIN nucleos n ON n.id = b.nucleo_id
       WHERE i.id = $1`,
      [id],
    );

    if (check.rows.length === 0) {
      throw new NotFoundException("Item", id);
    }

    if (check.rows[0].user_id !== userId) {
      throw new ForbiddenException("Sem permissão para editar este item");
    }

    const itemResult = await pool.query(
      `SELECT colecao_id FROM itens WHERE id = $1`,
      [id],
    );
    const colecaoId = itemResult.rows[0].colecao_id;

    // Buscar campos da coleção
    const campos = await pool.query(
      `SELECT id, tipo_campo FROM campos WHERE colecao_id = $1`,
      [colecaoId],
    );

    const valoresMap: Record<string, any> = {};

    for (const campo of campos.rows) {
      const valor = valores[campo.id];
      valoresMap[campo.id] = valor;

      // Verificar se já existe valor
      const existing = await pool.query(
        `SELECT id FROM item_valores WHERE item_id = $1 AND campo_id = $2`,
        [id, campo.id],
      );

      if (existing.rows.length > 0) {
        // Atualizar
        switch (campo.tipo_campo) {
          case "texto":
            await pool.query(
              `UPDATE item_valores SET valor_texto = $1 WHERE item_id = $2 AND campo_id = $3`,
              [valor?.toString() || null, id, campo.id],
            );
            break;
          case "numero":
            await pool.query(
              `UPDATE item_valores SET valor_numerico = $1 WHERE item_id = $2 AND campo_id = $3`,
              [valor !== undefined ? Number(valor) : null, id, campo.id],
            );
            break;
          case "data":
            await pool.query(
              `UPDATE item_valores SET valor_data = $1 WHERE item_id = $2 AND campo_id = $3`,
              [valor ? new Date(valor) : null, id, campo.id],
            );
            break;
          case "booleano":
            await pool.query(
              `UPDATE item_valores SET valor_booleano = $1 WHERE item_id = $2 AND campo_id = $3`,
              [valor !== undefined ? Boolean(valor) : null, id, campo.id],
            );
            break;
        }
      } else {
        // Criar novo
        const valorId = randomUUID();
        switch (campo.tipo_campo) {
          case "texto":
            await pool.query(
              `INSERT INTO item_valores (id, item_id, campo_id, valor_texto, created_at)
               VALUES ($1, $2, $3, $4, NOW())`,
              [valorId, id, campo.id, valor?.toString() || null],
            );
            break;
          case "numero":
            await pool.query(
              `INSERT INTO item_valores (id, item_id, campo_id, valor_numerico, created_at)
               VALUES ($1, $2, $3, $4, NOW())`,
              [
                valorId,
                id,
                campo.id,
                valor !== undefined ? Number(valor) : null,
              ],
            );
            break;
          case "data":
            await pool.query(
              `INSERT INTO item_valores (id, item_id, campo_id, valor_data, created_at)
               VALUES ($1, $2, $3, $4, NOW())`,
              [valorId, id, campo.id, valor ? new Date(valor) : null],
            );
            break;
          case "booleano":
            await pool.query(
              `INSERT INTO item_valores (id, item_id, campo_id, valor_booleano, created_at)
               VALUES ($1, $2, $3, $4, NOW())`,
              [
                valorId,
                id,
                campo.id,
                valor !== undefined ? Boolean(valor) : null,
              ],
            );
            break;
        }
      }
    }

    await pool.query(`UPDATE itens SET updated_at = NOW() WHERE id = $1`, [id]);

    return {
      id,
      colecaoId,
      valores: valoresMap,
      createdAt: (
        await pool.query(`SELECT created_at FROM itens WHERE id = $1`, [id])
      ).rows[0].created_at,
      updatedAt: new Date().toISOString(),
    };
  }
}
