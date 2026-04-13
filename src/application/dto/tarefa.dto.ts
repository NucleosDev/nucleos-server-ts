import { PrioridadeTarefa, StatusTarefa } from "../../domain/entities/Tarefa";

export interface CreateTarefaDto {
  blocoId: string;
  titulo: string;
  descricao?: string;
  prioridade?: PrioridadeTarefa;
  dataVencimento?: Date;
}

export interface UpdateTarefaDto {
  titulo?: string;
  descricao?: string;
  prioridade?: PrioridadeTarefa;
  dataVencimento?: Date | null;
  posicao?: number;
}

export interface TarefaResponseDto {
  id: string;
  blocoId: string;
  titulo: string;
  descricao: string | null;
  prioridade: PrioridadeTarefa;
  status: StatusTarefa;
  dataVencimento: string | null;
  concluidaEm: string | null;
  posicao: number;
  isAtrasada: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TarefaVencendoResponseDto extends TarefaResponseDto {
  nucleoId: string;
  nucleoNome: string;
  blocoTitulo: string;
}
