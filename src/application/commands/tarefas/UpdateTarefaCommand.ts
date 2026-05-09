import type { PrioridadeTarefa, StatusTarefa } from "../../../domain/entities/Tarefa.js";

export class UpdateTarefaCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly titulo?: string,
    public readonly descricao?: string | null,
    public readonly prioridade?: PrioridadeTarefa,
    public readonly status?: StatusTarefa,
    public readonly dataVencimento?: Date | null,
  ) {}
}
