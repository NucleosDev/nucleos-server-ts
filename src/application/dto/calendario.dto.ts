export interface CreateEventoDto {
  nucleoId: string;
  titulo: string;
  descricao?: string;
  dataEvento: string | Date;
  duracaoMinutos?: number;
}

export interface UpdateEventoDto {
  titulo?: string;
  descricao?: string;
  dataEvento?: string | Date;
  duracaoMinutos?: number;
}

export interface EventoResponseDto {
  id: string;
  nucleoId: string;
  titulo: string;
  descricao: string | null;
  dataEvento: string;
  duracaoMinutos: number | null;
  createdAt: string;
  updatedAt: string;
}
