import { IListaRepository } from "../../../domain/repositories/IListaRepository";
import { CreateCategoriaCommand } from "./CreateCategoriaCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { randomUUID } from "crypto";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class CreateCategoriaHandler {
  constructor(private readonly listaRepository: IListaRepository) {}

  async execute(command: CreateCategoriaCommand): Promise<any> {
    const { userId, listaId, nome, cor } = command;

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
        "Sem permissão para criar categoria nesta lista",
      );
    }

    const id = randomUUID();
    await pool.query(
      `INSERT INTO categorias (id, lista_id, nome, cor, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [id, listaId, nome, cor || null],
    );

    const result = await pool.query(`SELECT * FROM categorias WHERE id = $1`, [
      id,
    ]);

    return {
      id: result.rows[0].id,
      listaId: result.rows[0].lista_id,
      nome: result.rows[0].nome,
      cor: result.rows[0].cor,
      createdAt: result.rows[0].created_at,
    };
  }
}
