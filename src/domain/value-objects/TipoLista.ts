export type TipoListaValue = "generica" | "compras" | "financeira";

export class TipoLista {
  private constructor(private readonly value: TipoListaValue) {}

  static GENERICA = new TipoLista("generica");
  static COMPRAS = new TipoLista("compras");
  static FINANCEIRA = new TipoLista("financeira");

  static from(value: string): TipoLista {
    const valid: TipoListaValue[] = ["generica", "compras", "financeira"];
    if (!valid.includes(value as TipoListaValue)) {
      throw new Error(`Invalid list type: "${value}"`);
    }
    return new TipoLista(value as TipoListaValue);
  }

  toString(): TipoListaValue {
    return this.value;
  }

  equals(other: TipoLista): boolean {
    return this.value === other.value;
  }

  hasPrice(): boolean {
    return this.value === "compras" || this.value === "financeira";
  }
}
