import { Tarefa } from "../entities/Tarefa.js";

export class TarefaDomainService {
  static markOverdue(tarefas: Tarefa[]): Tarefa[] {
    const now = new Date();
    return tarefas.filter(
      (t) =>
        t.status === "pendente" &&
        t.dataVencimento !== null &&
        t.dataVencimento < now,
    );
  }

  static sortByPriority(tarefas: Tarefa[]): Tarefa[] {
    const weight = { alta: 3, media: 2, baixa: 1 } as const;
    return [...tarefas].sort(
      (a, b) =>
        (weight[b.prioridade] ?? 0) - (weight[a.prioridade] ?? 0),
    );
  }

  static completionRate(tarefas: Tarefa[]): number {
    if (tarefas.length === 0) return 0;
    const done = tarefas.filter((t) => t.status === "concluida").length;
    return Math.round((done / tarefas.length) * 100);
  }
}
