import { Tarefa } from "../../domain/entities/Tarefa";
import { TarefaResponseDto } from "../dto/tarefa.dto";

export interface UpdateTarefaData {
  titulo?: string;
  descricao?: string | null;
  prioridade?: "baixa" | "media" | "alta";
  dataVencimento?: Date | null;
  posicao?: number;
}

export class TarefaMapper {
  static toDTO(tarefa: Tarefa): TarefaResponseDto {
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

  // Para updates, usamos um tipo separado (não a entidade diretamente)
  static toUpdateData(dto: Partial<TarefaResponseDto>): UpdateTarefaData {
    return {
      titulo: dto.titulo,
      descricao: dto.descricao,
      prioridade: dto.prioridade,
      dataVencimento: dto.dataVencimento
        ? new Date(dto.dataVencimento)
        : undefined,
      posicao: dto.posicao,
    };
  }
}
