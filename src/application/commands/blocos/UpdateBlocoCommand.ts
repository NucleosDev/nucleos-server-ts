import { TipoBloco } from "../../../domain/value-objects/TipoBloco";

export class UpdateBlocoCommand {
  constructor(
    public readonly id: string,
    public readonly nucleoId: string,
    public readonly titulo?: string,
    public readonly tipo?: TipoBloco,
    public readonly posicao?: number,
    public readonly configuracoes?: Record<string, any>,
  ) {}
}
