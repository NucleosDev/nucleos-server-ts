import { TipoBloco } from "../../../domain/value-objects/TipoBloco";

export class CreateBlocoCommand {
  constructor(
    public readonly nucleoId: string,
    public readonly tipo: TipoBloco,
    public readonly titulo?: string,
    public readonly posicao?: number,
    public readonly configuracoes?: Record<string, any>,
  ) {}
}
