// src/application/commands/blocos/UpdateBlocoCommand.ts
export class UpdateBlocoCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly nucleoId: string,
    public readonly titulo?: string,
    public readonly tipo?: string,
    public readonly posicao?: number,
    public readonly configuracoes?: Record<string, any>,
    // NOVOS
    public readonly parentId?: string | null,
  ) {}
}
