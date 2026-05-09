import { ITarefaRepository } from "../../../domain/repositories/ITarefaRepository.js";
import { UpdateTarefaCommand } from "./UpdateTarefaCommand.js";
import { TarefaResponseDto } from "../../dto/tarefa.dto.js";
import { NotFoundException } from "../../common/exceptions/not-found.exception.js";
import {
  deleteCache,
  CacheKeys,
} from "../../../infrastructure/cache/redis.service.js";

export class UpdateTarefaHandler {
  constructor(private readonly tarefaRepository: ITarefaRepository) {}

  async execute(command: UpdateTarefaCommand): Promise<TarefaResponseDto> {
    const tarefa = await this.tarefaRepository.findById(command.id);
    if (!tarefa) throw new NotFoundException("Tarefa", command.id);

    if (command.titulo !== undefined) tarefa.updateTitulo(command.titulo);
    if (command.descricao !== undefined) tarefa.updateDescricao(command.descricao);
    if (command.prioridade !== undefined) tarefa.updatePrioridade(command.prioridade);
    if (command.status !== undefined) tarefa.updateStatus(command.status);
    if (command.dataVencimento !== undefined) tarefa.updateDataVencimento(command.dataVencimento);

    await this.tarefaRepository.update(tarefa);
    await deleteCache(CacheKeys.tarefasByBloco(tarefa.blocoId));

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
