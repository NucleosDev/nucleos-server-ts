export type TipoBloco =
  | "tarefas"
  | "habitos"
  | "habito"
  | "notas"
  | "lista"
  | "calendario"
  | "calculo"
  | "colecoes"
  | "timer";

export const TIPO_BLOCO_VALORES: TipoBloco[] = [
  "tarefas",
  "habitos",
  "habito",
  "notas",
  "lista",
  "calendario",
  "calculo",
  "colecoes",
  "timer",
];

export function isTipoBloco(valor: string): valor is TipoBloco {
  return TIPO_BLOCO_VALORES.includes(valor as TipoBloco);
}
