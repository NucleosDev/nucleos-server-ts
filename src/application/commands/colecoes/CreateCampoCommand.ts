import { TipoCampo } from "../../../domain/entities/Campo";

export class CreateCampoCommand {
  constructor(
    public readonly colecaoId: string,
    public readonly nome: string,
    public readonly tipoCampo: TipoCampo,
  ) {}
}
