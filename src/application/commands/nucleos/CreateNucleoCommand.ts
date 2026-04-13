export class CreateNucleoCommand {
  constructor(
    public readonly userId: string,
    public readonly nome: string,
    public readonly descricao?: string,
    public readonly tipo?: string, 
    public readonly corDestaque?: string,
    public readonly imagemCapa?: string,
    public readonly iconId?: string,
  ) {}
}
