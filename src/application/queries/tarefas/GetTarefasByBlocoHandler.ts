import { ITarefaRepository } from "../../../domain/repositories/ITarefaRepository";
import { TarefaResponseDto } from "../../dto/tarefa.dto";
import { GetTarefasByBlocoQuery } from "./GetTarefasByBlocoQuery";

export class GetTarefasByBlocoHandler {
  constructor(private readonly tarefaRepository: ITarefaRepository) {}

  async execute(query: GetTarefasByBlocoQuery): Promise<TarefaResponseDto[]> {
    const tarefas = await this.tarefaRepository.findAllByBlocoId(query.blocoId);

    return tarefas.map((tarefa) => ({
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
    }));
  }
}
