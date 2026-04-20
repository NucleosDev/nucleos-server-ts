export class StartTimerCommand {
  constructor(
    public readonly nucleoId: string,
    public readonly userId: string,
    public readonly titulo?: string,
    public readonly duracaoSegundos?: number,
    public readonly modo?: "crescente" | "decrescente",
  ) {}
}
