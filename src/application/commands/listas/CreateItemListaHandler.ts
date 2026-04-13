import { IListaRepository } from "../../../domain/repositories/IListaRepository";
import { CreateItemListaCommand } from "./CreateItemListaCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { randomUUID } from "crypto";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class CreateItemListaHandler {
  constructor(private readonly listaRepository: IListaRepository) {}

  async execute(command: CreateItemListaCommand): Promise<any> {
    const { userId, listaId, nome, quantidade, valorUnitario, categoriaId } =
      command;

    // Verificar permissão
    const check = await pool.query(
      `SELECT n.user_id FROM listas l
       JOIN blocos b ON b.id = l.bloco_id
       JOIN nucleos n ON n.id = b.nucleo_id
       WHERE l.id = $1 AND l.deleted_at IS NULL`,
      [listaId],
    );

    if (check.rows.length === 0) {
      throw new NotFoundException("Lista", listaId);
    }

    if (check.rows[0].user_id !== userId) {
      throw new ForbiddenException(
        "Sem permissão para adicionar itens nesta lista",
      );
    }

    const id = randomUUID();
    const quantidadeFinal = quantidade || 1;

    await pool.query(
      `INSERT INTO itens_lista (id, lista_id, categoria_id, nome, quantidade, valor_unitario, checked, created_at, updated_at)
   VALUES ($1, $2, $3, $4, $5, $6, false, NOW(), NOW())`,
      [
        id,
        listaId,
        categoriaId || null,
        nome,
        quantidadeFinal,
        valorUnitario || null,
        // valorTotal
      ],
    );

    const result = await pool.query(`SELECT * FROM itens_lista WHERE id = $1`, [
      id,
    ]);

    return {
      id: result.rows[0].id,
      listaId: result.rows[0].lista_id,
      categoriaId: result.rows[0].categoria_id,
      nome: result.rows[0].nome,
      quantidade: result.rows[0].quantidade,
      valorUnitario: result.rows[0].valor_unitario,
      valorTotal: result.rows[0].valor_total,
      checked: result.rows[0].checked,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at,
    };
  }
}
