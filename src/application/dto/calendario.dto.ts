export interface CreateEventoDto {
  nucleoId: string;
  titulo: string;
  descricao?: string;
  dataEvento: Date;
  duracaoMinutos?: number;
}

export interface UpdateEventoDto {
  titulo?: string;
  descricao?: string;
  dataEvento?: Date;
  duracaoMinutos?: number | null;
}

export interface EventoResponseDto {
  id: string;
  nucleoId: string;
  titulo: string;
  descricao: string | null;
  dataEvento: string;
  duracaoMinutos: number | null;
  dataFim: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventoPorPeriodoDto {
  startDate: Date;
  endDate: Date;
}
