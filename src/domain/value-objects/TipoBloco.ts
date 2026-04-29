// src/domain/value-objects/TipoBloco.ts
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

// Array de valores para validação e iteração
export const TIPO_BLOCO_VALORES: readonly string[] = [
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
] as const;

// Validador principal
export function isTipoBloco(value: string): value is TipoBloco {
  return TIPO_BLOCO_VALORES.includes(value);
}

// Função utilitária para garantir tipo seguro (retorna null se inválido)
export function toTipoBloco(value: string): TipoBloco | null {
  return isTipoBloco(value) ? value : null;
}

// Função utilitária para validar e lançar erro
export function validateTipoBloco(value: string): TipoBloco {
  if (!isTipoBloco(value)) {
    throw new Error(
      `Tipo inválido: ${value}. Valores permitidos: ${TIPO_BLOCO_VALORES.join(", ")}`,
    );
  }
  return value;
}

// Para compatibilidade com arrays em outras camadas
export const TIPO_BLOCO_LIST = [...TIPO_BLOCO_VALORES];
export const TIPO_BLOCO_SET = new Set(TIPO_BLOCO_VALORES);
