export type TipoBloco =
  | "tarefas"
  | "habitos"
  | "habito"
  | "timer"
  | "timers"
  | "notas"
  | "lista"
  | "calendario"
  | "calculo"
  | "colecoes"
  | "canvas";

export function isTipoBloco(value: string): value is TipoBloco {
  return [
    "tarefas",
    "habitos",
    "habito",
    "timer",
    "timers",
    "notas",
    "lista",
    "calendario",
    "calculo",
    "colecoes",
    "canvas",
  ].includes(value);
}
