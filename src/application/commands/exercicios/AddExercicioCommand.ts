export class AddExercicioCommand {
  constructor(
    public readonly userId: string,
    public readonly templateId: string,
    public readonly nome: string,
    public readonly series?: number,
    public readonly repeticoes?: number,
    public readonly pesoKg?: number | null,
    public readonly ordem?: number,
  ) {}
}
