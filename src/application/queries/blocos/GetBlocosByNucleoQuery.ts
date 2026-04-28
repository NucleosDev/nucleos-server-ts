// src/application/queries/blocos/GetBlocosByNucleoQuery.ts
export class GetBlocosByNucleoQuery {
  constructor(
    public readonly nucleoId: string,
    public readonly userId: string,
    // NOVO: Filtro opcional por parent
    public readonly parentId?: string | null,
  ) {}
}
