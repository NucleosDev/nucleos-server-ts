export class GetEventosByNucleoQuery {
  constructor(
    public readonly nucleoId: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
  ) {}
}
