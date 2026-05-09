export type PrioridadeTarefaValue = "baixa" | "media" | "alta";

export class PrioridadeTarefa {
  private constructor(private readonly value: PrioridadeTarefaValue) {}

  static BAIXA = new PrioridadeTarefa("baixa");
  static MEDIA = new PrioridadeTarefa("media");
  static ALTA = new PrioridadeTarefa("alta");

  static from(value: string): PrioridadeTarefa {
    const valid: PrioridadeTarefaValue[] = ["baixa", "media", "alta"];
    if (!valid.includes(value as PrioridadeTarefaValue)) {
      throw new Error(`Invalid priority: "${value}"`);
    }
    return new PrioridadeTarefa(value as PrioridadeTarefaValue);
  }

  toString(): PrioridadeTarefaValue {
    return this.value;
  }

  equals(other: PrioridadeTarefa): boolean {
    return this.value === other.value;
  }

  weight(): number {
    return { baixa: 1, media: 2, alta: 3 }[this.value];
  }
}
