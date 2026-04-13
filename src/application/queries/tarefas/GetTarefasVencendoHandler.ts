import { ITarefaRepository } from "../../../domain/repositories/ITarefaRepository";
import { GetTarefasVencendoQuery } from "./GetTarefasVencendoQuery";
import { TarefaVencendoResponseDto } from "../../dto/tarefa.dto";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class GetTarefasVencendoHandler {
  constructor(private readonly tarefaRepository: ITarefaRepository) {}

  async execute(
    query: GetTarefasVencendoQuery,
  ): Promise<TarefaVencendoResponseDto[]> {
    const { userId } = query;

    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const result = await pool.query(
      `SELECT 
        t.id, t.bloco_id, t.titulo, t.descricao, t.prioridade, t.status, 
        t.data_vencimento, t.concluida_em, t.posicao, t.created_at, t.updated_at,
        b.titulo as bloco_titulo,
        n.id as nucleo_id, n.nome as nucleo_nome
       FROM tarefas t
       JOIN blocos b ON b.id = t.bloco_id AND b.deleted_at IS NULL
       JOIN nucleos n ON n.id = b.nucleo_id AND n.deleted_at IS NULL
       WHERE n.user_id = $1 
         AND t.deleted_at IS NULL 
         AND t.status = 'pendente'
         AND t.data_vencimento < NOW()
       ORDER BY t.data_vencimento ASC`,
      [userId],
    );

    return result.rows.map((row) => ({
      id: row.id,
      blocoId: row.bloco_id,
      titulo: row.titulo,
      descricao: row.descricao,
      prioridade: row.prioridade,
      status: row.status,
      dataVencimento: row.data_vencimento?.toISOString() || null,
      concluidaEm: row.concluida_em?.toISOString() || null,
      posicao: row.posicao,
      isAtrasada: true,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
      nucleoId: row.nucleo_id,
      nucleoNome: row.nucleo_nome,
      blocoTitulo: row.bloco_titulo,
    }));
  }
}
