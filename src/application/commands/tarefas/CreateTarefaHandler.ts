import { Tarefa, PrioridadeTarefa } from "../../../domain/entities/Tarefa";
import { ITarefaRepository } from "../../../domain/repositories/ITarefaRepository";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { CreateTarefaCommand } from "./CreateTarefaCommand";
import { TarefaResponseDto } from "../../dto/tarefa.dto";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class CreateTarefaHandler {
  constructor(private readonly tarefaRepository: ITarefaRepository) {}

  async execute(command: CreateTarefaCommand): Promise<TarefaResponseDto> {
    const { userId, blocoId, titulo, descricao, prioridade, dataVencimento } =
      command;

    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar se o bloco pertence ao usuário
    const blocoCheck = await pool.query(
      `SELECT b.id, n.user_id 
       FROM blocos b
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE b.id = $1 AND b.deleted_at IS NULL`,
      [blocoId],
    );

    if (blocoCheck.rows.length === 0) {
      throw new NotFoundException("Bloco", blocoId);
    }

    if (blocoCheck.rows[0].user_id !== userId) {
      throw new ForbiddenException(
        "Você não tem permissão para criar tarefas neste bloco",
      );
    }

    const posicao = await this.tarefaRepository.getNextPosition(blocoId);
    const prioridadeFinal: PrioridadeTarefa = prioridade || "media";

    const tarefa = Tarefa.create({
      blocoId,
      titulo,
      descricao,
      prioridade: prioridadeFinal,
      dataVencimento,
      posicao,
    });

    await this.tarefaRepository.save(tarefa);

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
