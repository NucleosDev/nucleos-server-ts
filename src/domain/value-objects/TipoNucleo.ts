export type TipoNucleoValue =
  | "pessoal"
  | "trabalho"
  | "estudos"
  | "saude"
  | "financeiro"
  | "projetos"
  | "outros";

export class TipoNucleo {
  private constructor(private readonly value: TipoNucleoValue) {}

  static from(value: string): TipoNucleo {
    const valid: TipoNucleoValue[] = [
      "pessoal",
      "trabalho",
      "estudos",
      "saude",
      "financeiro",
      "projetos",
      "outros",
    ];
    if (!valid.includes(value as TipoNucleoValue)) {
      throw new Error(`Invalid nucleo type: "${value}"`);
    }
    return new TipoNucleo(value as TipoNucleoValue);
  }

  toString(): TipoNucleoValue {
    return this.value;
  }

  equals(other: TipoNucleo): boolean {
    return this.value === other.value;
  }
}
