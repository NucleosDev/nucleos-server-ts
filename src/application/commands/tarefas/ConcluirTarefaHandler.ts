import { ITarefaRepository } from "../../../domain/repositories/ITarefaRepository";
import { ConcluirTarefaCommand } from "./ConcluirTarefaCommand";
import { TarefaResponseDto } from "../../dto/tarefa.dto";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";
import { NotificationsController } from "../../../api/controllers/v1/NotificationsController";
export class ConcluirTarefaHandler {
  constructor(private readonly tarefaRepository: ITarefaRepository) {}

  async execute(command: ConcluirTarefaCommand): Promise<TarefaResponseDto> {
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
        "Você não tem permissão para concluir esta tarefa",
      );
    }

    tarefa.concluir();
    await this.tarefaRepository.update(tarefa);
    await NotificationsController.createNotification(
      command.userId,
      "Tarefa Concluída!",
      `Você completou "${tarefa.titulo}" e ganhou 50 XP!`,
    );
    return {
      id: tarefa.id,
      blocoId: tarefa.blocoId,
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      prioridade: tarefa.prioridade,
      status: tarefa.status,
      dataVencimento: tarefa.dataVencimento?.toISOString() || null,
      concluidaEm: tarefa.concluidaEm?.toISOString() || null,
      posicao: tarefa.posicao,
      isAtrasada: tarefa.isAtrasada,
      createdAt: tarefa.createdAt.toISOString(),
      updatedAt: tarefa.updatedAt.toISOString(),
    };
  }
}
