export class GetEventosByNucleoQuery {
  constructor(
    public readonly userId: string,
    public readonly nucleoId: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
  ) {}
}
