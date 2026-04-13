// application/queries/colecoes/GetItemsByColecaoHandler.ts
import { IColecaoRepository } from "../../../domain/repositories/IColecaoRepository";
import { ItemComValoresResponseDto } from "../../dto/colecao.dto";
import { GetItemsByColecaoQuery } from "./GetItemsByColecaoQuery";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class GetItemsByColecaoHandler {
  constructor(private readonly colecaoRepository: IColecaoRepository) {}

  async execute(
    query: GetItemsByColecaoQuery,
  ): Promise<ItemComValoresResponseDto[]> {
    const { colecaoId, userId } = query;

    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

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
        "Sem permissão para ver itens desta coleção",
      );
    }

    const items = await pool.query(
      `SELECT i.id, i.colecao_id, i.created_at, i.updated_at
       FROM itens i
       WHERE i.colecao_id = $1
       ORDER BY i.created_at ASC`,
      [colecaoId],
    );

    const result: ItemComValoresResponseDto[] = [];

    for (const item of items.rows) {
      const valores = await pool.query(
        `SELECT iv.campo_id, iv.valor_texto, iv.valor_numerico, iv.valor_data, iv.valor_booleano
         FROM item_valores iv
         WHERE iv.item_id = $1`,
        [item.id],
      );

      const valoresMap: Record<string, any> = {};

      for (const valor of valores.rows) {
        if (valor.valor_texto !== null) {
          valoresMap[valor.campo_id] = valor.valor_texto;
        } else if (valor.valor_numerico !== null) {
          valoresMap[valor.campo_id] = valor.valor_numerico;
        } else if (valor.valor_data !== null) {
          valoresMap[valor.campo_id] = valor.valor_data;
        } else if (valor.valor_booleano !== null) {
          valoresMap[valor.campo_id] = valor.valor_booleano;
        }
      }

      result.push({
        id: item.id,
        colecaoId: item.colecao_id,
        valores: valoresMap,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      });
    }

    return result;
  }
}
