import { TipoLista } from "../../../domain/entities/Lista";

export class CreateListaCommand {
  constructor(
    public readonly blocoId: string,
    public readonly nome: string,
    public readonly tipoLista?: TipoLista,
  ) {}
}
