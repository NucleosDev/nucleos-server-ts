import { ITarefaRepository } from "../../../domain/repositories/ITarefaRepository";
import { DeleteTarefaCommand } from "./DeleteTarefaCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class DeleteTarefaHandler {
  constructor(private readonly tarefaRepository: ITarefaRepository) {}

  async execute(command: DeleteTarefaCommand): Promise<void> {
    const { id, userId } = command;

    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const tarefa = await this.tarefaRepository.findById(id);
    if (!tarefa) {
      throw new NotFoundException("Tarefa", id);
    }

    // Verificar permissão
    const blocoCheck = await pool.query(
      `SELECT n.user_id 
       FROM blocos b
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE b.id = $1`,
      [tarefa.blocoId],
    );

    if (blocoCheck.rows.length === 0 || blocoCheck.rows[0].user_id !== userId) {
      throw new ForbiddenException(
        "Você não tem permissão para deletar esta tarefa",
      );
    }

    await this.tarefaRepository.delete(id);
  }
}
