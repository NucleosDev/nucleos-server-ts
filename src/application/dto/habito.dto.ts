import { FrequenciaHabito } from "../../domain/entities/Habito";

export interface CreateHabitoDto {
  blocoId: string;
  nome: string;
  frequencia?: FrequenciaHabito;
  diasSemana?: number[];
  metaVezes?: number;
}

export interface UpdateHabitoDto {
  nome?: string;
  frequencia?: FrequenciaHabito;
  diasSemana?: number[] | null;
  metaVezes?: number | null;
}

export interface HabitoResponseDto {
  id: string;
  blocoId: string;
  nome: string;
  frequencia: FrequenciaHabito;
  diasSemana: number[] | null;
  metaVezes: number | null;
  streakAtual: number;
  streakMaximo: number;
  completoHoje: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrarHabitoDto {
  habitoId: string;
  data: Date;
  vezesCompletadas?: number;
}

export interface HabitoRegistroResponseDto {
  id: string;
  habitoId: string;
  data: string;
  vezesCompletadas: number;
  createdAt: string;
}

export interface HabitoProgressoResponseDto {
  habitoId: string;
  nome: string;
  streakAtual: number;
  streakMaximo: number;
  totalRegistros: number;
  registrosPorMes: Record<string, number>;
}
