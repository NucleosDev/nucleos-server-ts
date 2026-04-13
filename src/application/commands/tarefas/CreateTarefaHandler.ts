import { Tarefa, PrioridadeTarefa } from "../../../domain/entities/Tarefa";
import { ITarefaRepository } from "../../../domain/repositories/ITarefaRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { CreateTarefaCommand } from "./CreateTarefaCommand";
import { TarefaResponseDto } from "../../dto/tarefa.dto";

export class CreateTarefaHandler {
  constructor(
    private readonly tarefaRepository: ITarefaRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(command: CreateTarefaCommand): Promise<TarefaResponseDto> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar se o bloco pertence ao usuário
    const blocoCheck = await pool.query(
      `SELECT b.id, n.user_id 
       FROM blocos b
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE b.id = $1 AND b.deleted_at IS NULL`,
      [command.blocoId],
    );

    if (blocoCheck.rows.length === 0) {
      throw new Error("Bloco não encontrado");
    }

    if (blocoCheck.rows[0].user_id !== userId) {
      throw new Error("Acesso negado");
    }

    const posicao = await this.tarefaRepository.getNextPosition(
      command.blocoId,
    );

    // 🔥 CORREÇÃO: Garantir que prioridade tenha um valor padrão
    const prioridade: PrioridadeTarefa = command.prioridade || "media";

    const tarefa = Tarefa.create({
      blocoId: command.blocoId,
      titulo: command.titulo,
      descricao: command.descricao,
      prioridade: prioridade,
      dataVencimento: command.dataVencimento,
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
