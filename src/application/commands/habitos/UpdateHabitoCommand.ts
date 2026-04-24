import { FrequenciaHabito } from "../../../domain/entities/Habito";

export class UpdateHabitoCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly nome?: string,
    public readonly frequencia?: FrequenciaHabito,
    public readonly diasSemana?: number[],
    public readonly metaVezes?: number,
  ) {}
}
