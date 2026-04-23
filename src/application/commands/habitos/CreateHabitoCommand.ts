import { FrequenciaHabito } from "../../../domain/entities/Habito";

export class CreateHabitoCommand {
  constructor(
    public readonly userId: string,
    public readonly blocoId: string,
    public readonly nome: string,
    public readonly frequencia?: FrequenciaHabito,
    public readonly diasSemana?: number[],
    public readonly metaVezes?: number,
  ) {}
}
