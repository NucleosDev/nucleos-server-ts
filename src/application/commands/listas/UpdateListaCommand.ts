import { TipoLista } from "../../../domain/entities/Lista";

export class UpdateListaCommand {
  constructor(
    public readonly id: string,
    public readonly nome?: string,
    public readonly tipoLista?: TipoLista,
  ) {}
}
