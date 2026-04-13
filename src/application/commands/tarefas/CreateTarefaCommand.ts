import { PrioridadeTarefa } from "../../../domain/entities/Tarefa";

export class CreateTarefaCommand {
  constructor(
    public readonly userId: string,
    public readonly blocoId: string,
    public readonly titulo: string,
    public readonly descricao?: string,
    public readonly prioridade?: PrioridadeTarefa,
    public readonly dataVencimento?: Date,
  ) {}
}
