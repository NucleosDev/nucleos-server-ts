// application/commands/blocos/CreateBlocoCommand.ts
export class CreateBlocoCommand {
  constructor(
    public readonly userId: string,
    public readonly nucleoId: string,
    public readonly tipo: string, // string (vai ser validado)
    public readonly titulo?: string,
    public readonly posicao?: number, // opcional (fallback 0)
    public readonly configuracoes?: Record<string, any>,
  ) {}
}
