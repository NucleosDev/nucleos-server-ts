export enum TipoBloco {
  TAREFAS = "tarefas",
  HABITOS = "habitos",
  NOTAS = "notas",
  LISTA = "lista",
  CALENDARIO = "calendario",
  CALCULO = "calculo",
  COLECOES = "colecoes",
}

export const isTipoBloco = (value: string): value is TipoBloco => {
  return Object.values(TipoBloco).includes(value as TipoBloco);
};
