import { ITarefaRepository } from "../../../domain/repositories/ITarefaRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { DeleteTarefaCommand } from "./DeleteTarefaCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class DeleteTarefaHandler {
  constructor(
    private readonly tarefaRepository: ITarefaRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(command: DeleteTarefaCommand): Promise<void> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const tarefa = await this.tarefaRepository.findById(command.id);
    if (!tarefa) {
      throw new Error("Tarefa não encontrada");
    }

    // Verificar permissão
    const blocoCheck = await pool.query(
      `SELECT n.user_id 
       FROM blocos b
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE b.id = $1`,
      [tarefa.blocoId],
    );

    if (blocoCheck.rows[0]?.user_id !== userId) {
      throw new Error("Acesso negado");
    }

    //  Soft delete
    await this.tarefaRepository.delete(command.id);
  }
}
