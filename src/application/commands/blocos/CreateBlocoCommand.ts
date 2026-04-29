// src/application/commands/blocos/CreateBlocoCommand.ts
export class CreateBlocoCommand {
  constructor(
    public readonly userId: string,
    public readonly nucleoId: string,
    public readonly tipo: string,
    public readonly titulo?: string,
    public readonly posicao?: number,
    public readonly configuracoes?: Record<string, any>,
    // NOVOS CAMPOS
    public readonly parentId?: string | null,
  ) {}
}
