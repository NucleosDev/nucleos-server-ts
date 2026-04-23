// src/domain/events/NivelAlcancadoEvent.ts
export class NivelAlcancadoEvent {
  constructor(
    public readonly userId: string,
    public readonly newLevel: number,
    public readonly oldLevel: number,
    public readonly ocorridoEm: Date = new Date(),
  ) {}
}
