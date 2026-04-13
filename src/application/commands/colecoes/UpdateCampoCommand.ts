import { TipoCampo } from "../../../domain/entities/Campo";

export class UpdateCampoCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly nome?: string,
    public readonly tipoCampo?: TipoCampo,
  ) {}
}
