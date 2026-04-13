export interface TimerDto {
  id: string;
  nucleoId: string;
  titulo: string | null;
  inicio: Date | null;
  fim: Date | null;
  duracaoSegundos: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StartTimerDto {
  nucleoId: string;
  titulo?: string;
}

export interface TimerSessionDto {
  id: string;
  duracaoSegundos: number;
  emAndamento: boolean;
}