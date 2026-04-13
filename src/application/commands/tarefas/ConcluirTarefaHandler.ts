import { ITarefaRepository } from "../../../domain/repositories/ITarefaRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { ConcluirTarefaCommand } from "./ConcluirTarefaCommand";
import { TarefaResponseDto } from "../../dto/tarefa.dto";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class ConcluirTarefaHandler {
  constructor(
    private readonly tarefaRepository: ITarefaRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(command: ConcluirTarefaCommand): Promise<TarefaResponseDto> {
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

    // 🔥 Concluir a tarefa (status muda para 'concluida', concluida_em = NOW())
    tarefa.concluir();
    await this.tarefaRepository.update(tarefa);

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
