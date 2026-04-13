// application/commands/listas/CreateListaHandler.ts
import { IListaRepository } from "../../../domain/repositories/IListaRepository";
import { CreateListaCommand } from "./CreateListaCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { randomUUID } from "crypto";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class CreateListaHandler {
  constructor(private readonly listaRepository: IListaRepository) {}

  async execute(command: CreateListaCommand): Promise<any> {
    const { userId, blocoId, nome, tipoLista } = command;

    // Verificar permissão
    const blocoCheck = await pool.query(
      `SELECT n.user_id FROM blocos b
       JOIN nucleos n ON n.id = b.nucleo_id
       WHERE b.id = $1 AND b.deleted_at IS NULL`,
      [blocoId],
    );

    if (blocoCheck.rows.length === 0) {
      throw new NotFoundException("Bloco", blocoId);
    }

    if (blocoCheck.rows[0].user_id !== userId) {
      throw new ForbiddenException(
        "Sem permissão para criar lista neste bloco",
      );
    }

    const id = randomUUID();
    await pool.query(
      `INSERT INTO listas (id, bloco_id, nome, tipo_lista, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [id, blocoId, nome, tipoLista || "generica"],
    );

    const result = await pool.query(`SELECT * FROM listas WHERE id = $1`, [id]);

    return {
      id: result.rows[0].id,
      blocoId: result.rows[0].bloco_id,
      nome: result.rows[0].nome,
      tipoLista: result.rows[0].tipo_lista,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at,
    };
  }
}
