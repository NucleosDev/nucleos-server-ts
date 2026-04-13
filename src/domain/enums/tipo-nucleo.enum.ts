export enum TipoNucleo {
  PESSOAL = "pessoal",
  PROFISSIONAL = "profissional",
  ESTUDO = "estudo",
  PROJETO = "projeto",
  HOBBY = "hobby",
  FITNESS = "fitness",
  FINANCAS = "financas",
  IDIOMAS = "idiomas",
  SAUDE = "saude",
}

export const isTipoNucleoPredefinido = (value: string): boolean => {
  return Object.values(TipoNucleo).includes(value as TipoNucleo);
};
