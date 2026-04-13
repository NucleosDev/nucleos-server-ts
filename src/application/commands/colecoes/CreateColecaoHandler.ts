import { IColecaoRepository } from "../../../domain/repositories/IColecaoRepository";
import { CreateColecaoCommand } from "./CreateColecaoCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { randomUUID } from "crypto";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class CreateColecaoHandler {
  constructor(private readonly colecaoRepository: IColecaoRepository) {}

  async execute(command: CreateColecaoCommand): Promise<any> {
    const { userId, blocoId, nome } = command;

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
        "Sem permissão para criar coleção neste bloco",
      );
    }

    const id = randomUUID();
    const now = new Date();

    await pool.query(
      `INSERT INTO colecoes (id, bloco_id, nome, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, blocoId, nome, now, now],
    );

    return {
      id,
      blocoId,
      nome,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }
}
