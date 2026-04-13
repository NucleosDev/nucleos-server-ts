import { ITarefaRepository } from "../../../domain/repositories/ITarefaRepository";
import { GetTarefasByBlocoQuery } from "./GetTarefasByBlocoQuery";
import { TarefaResponseDto } from "../../dto/tarefa.dto";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

export class GetTarefasByBlocoHandler {
  constructor(private readonly tarefaRepository: ITarefaRepository) {}

  async execute(query: GetTarefasByBlocoQuery): Promise<TarefaResponseDto[]> {
    const { blocoId, userId } = query;

    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar permissão
    const blocoCheck = await pool.query(
      `SELECT n.user_id 
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
        "Você não tem permissão para ver tarefas deste bloco",
      );
    }

    const tarefas = await this.tarefaRepository.findByBlocoId(blocoId);

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
