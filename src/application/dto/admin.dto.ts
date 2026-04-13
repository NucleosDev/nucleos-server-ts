export interface DashboardStatsDto {
  totalUsuarios: number;
  totalNucleos: number;
  totalTarefasConcluidas: number;
  totalHabitosAtivos: number;
  nucleosAtivos: number;
  tarefasConcluidasHoje: number;
  minutosConcentradosHoje: number;
  progressoGeral: number;
}

export interface AdminUserDto {
  id: string;
  email: string;
  fullName: string;
  active: boolean;
  createdAt: Date;
  totalNucleos: number;
}
