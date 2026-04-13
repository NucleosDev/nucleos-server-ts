export type TipoBloco =
  | "tarefas"
  | "habitos"
  | "notas"
  | "lista"
  | "calendario"
  | "calculo";

export const TIPO_BLOCO_VALORES: TipoBloco[] = [
  "tarefas",
  "habitos",
  "notas",
  "lista",
  "calendario",
  "calculo",
];

export function isTipoBloco(valor: string): valor is TipoBloco {
  return TIPO_BLOCO_VALORES.includes(valor as TipoBloco);
}
