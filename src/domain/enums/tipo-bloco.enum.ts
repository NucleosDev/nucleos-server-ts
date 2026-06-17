export enum TipoBloco {
  TAREFAS = "tarefas",
  HABITOS = "habitos",
  NOTAS = "notas",
  LISTA = "lista",
  CALENDARIO = "calendario",
  CALCULO = "calculo",
  COLECOES = "colecoes",
  TABELA = "tabela",
  GALERIA = "galeria",
  QUADRO = "quadro",
  TIMER = "timer",
  TIMERS = "timers",
  EXERCICIOS = "exercicios",
}

export const isTipoBloco = (value: string): value is TipoBloco => {
  return Object.values(TipoBloco).includes(value as TipoBloco);
};
