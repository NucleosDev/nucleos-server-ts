import { Item } from "../../../domain/entities/Item";
import { ItemValor } from "../../../domain/entities/ItemValor";
import { IColecaoRepository } from "../../../domain/repositories/IColecaoRepository";
import { CreateItemCommand } from "./CreateItemCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { randomUUID } from "crypto";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class CreateItemHandler {
  constructor(private readonly colecaoRepository: IColecaoRepository) {}

  async execute(command: CreateItemCommand): Promise<any> {
    const { userId, colecaoId, valores } = command;

    // Verificar permissão
    const check = await pool.query(
      `SELECT n.user_id FROM colecoes c
       JOIN blocos b ON b.id = c.bloco_id
       JOIN nucleos n ON n.id = b.nucleo_id
       WHERE c.id = $1`,
      [colecaoId],
    );

    if (check.rows.length === 0) {
      throw new NotFoundException("Coleção", colecaoId);
    }

    if (check.rows[0].user_id !== userId) {
      throw new ForbiddenException(
        "Sem permissão para adicionar itens nesta coleção",
      );
    }

    // Buscar campos da coleção
    const campos = await pool.query(
      `SELECT id, tipo_campo FROM campos WHERE colecao_id = $1`,
      [colecaoId],
    );

    const itemId = randomUUID();
    const now = new Date();

    await pool.query(
      `INSERT INTO itens (id, colecao_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4)`,
      [itemId, colecaoId, now, now],
    );

    const valoresMap: Record<string, any> = {};

    for (const campo of campos.rows) {
      const valor = valores[campo.id];
      const valorId = randomUUID();

      switch (campo.tipo_campo) {
        case "texto":
          await pool.query(
            `INSERT INTO item_valores (id, item_id, campo_id, valor_texto, created_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [valorId, itemId, campo.id, valor?.toString() || null],
          );
          break;
        case "numero":
          await pool.query(
            `INSERT INTO item_valores (id, item_id, campo_id, valor_numerico, created_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [
              valorId,
              itemId,
              campo.id,
              valor !== undefined ? Number(valor) : null,
            ],
          );
          break;
        case "data":
          await pool.query(
            `INSERT INTO item_valores (id, item_id, campo_id, valor_data, created_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [valorId, itemId, campo.id, valor ? new Date(valor) : null],
          );
          break;
        case "booleano":
          await pool.query(
            `INSERT INTO item_valores (id, item_id, campo_id, valor_booleano, created_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [
              valorId,
              itemId,
              campo.id,
              valor !== undefined ? Boolean(valor) : null,
            ],
          );
          break;
        default:
          await pool.query(
            `INSERT INTO item_valores (id, item_id, campo_id, valor_texto, created_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [valorId, itemId, campo.id, valor?.toString() || null],
          );
      }
      valoresMap[campo.id] = valor;
    }

    return {
      id: itemId,
      colecaoId,
      valores: valoresMap,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }
}
