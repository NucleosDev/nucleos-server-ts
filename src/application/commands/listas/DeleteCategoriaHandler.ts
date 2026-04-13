// application/commands/listas/DeleteCategoriaHandler.ts
import { IListaRepository } from "../../../domain/repositories/IListaRepository";
import { DeleteCategoriaCommand } from "./DeleteCategoriaCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class DeleteCategoriaHandler {
  constructor(private readonly listaRepository: IListaRepository) {}

  async execute(command: DeleteCategoriaCommand): Promise<void> {
    const { id, userId } = command;

    // Verificar permissão
    const check = await pool.query(
      `SELECT n.user_id FROM categorias c
       JOIN listas l ON l.id = c.lista_id
       JOIN blocos b ON b.id = l.bloco_id
       JOIN nucleos n ON n.id = b.nucleo_id
       WHERE c.id = $1`,
      [id],
    );

    if (check.rows.length === 0) {
      throw new NotFoundException("Categoria", id);
    }

    if (check.rows[0].user_id !== userId) {
      throw new ForbiddenException("Sem permissão para deletar esta categoria");
    }

    await pool.query(`DELETE FROM categorias WHERE id = $1`, [id]);
  }
}
