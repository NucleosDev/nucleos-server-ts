import { IColecaoRepository } from "../../../domain/repositories/IColecaoRepository";
import { CreateCampoCommand } from "./CreateCampoCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { randomUUID } from "crypto";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class CreateCampoHandler {
  constructor(private readonly colecaoRepository: IColecaoRepository) {}

  async execute(command: CreateCampoCommand): Promise<any> {
    const { userId, colecaoId, nome, tipoCampo } = command;

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
        "Sem permissão para criar campo nesta coleção",
      );
    }

    const id = randomUUID();
    const now = new Date();

    await pool.query(
      `INSERT INTO campos (id, colecao_id, nome, tipo_campo, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $5)`,
      [id, colecaoId, nome, tipoCampo, now],
    );

    return {
      id,
      colecaoId,
      nome,
      tipoCampo,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }
}
