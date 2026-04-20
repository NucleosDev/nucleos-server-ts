export interface TimerDto {
  id: string;
  nucleoId: string;
  titulo: string;
  inicio: string;
  fim: string | null;
  duracaoSegundos: number | null;
  modo: "crescente" | "decrescente";
  createdAt: string;
  updatedAt: string;
}

export interface StartTimerDto {
  nucleoId: string;
  titulo?: string;
  duracaoSegundos?: number;
  modo?: "crescente" | "decrescente";
}

export interface StopTimerDto {
  duracaoSegundos: number;
  xpGanho: number;
}
