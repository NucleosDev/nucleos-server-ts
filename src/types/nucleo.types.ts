// export type NucleoTipo =
//   | "pessoal"
//   | "profissional"
//   | "estudo"
//   | "projeto"
//   | "hobby"
//   | "fitness"
//   | "financas"
//   | "idiomas"
//   | "saude";

// export type BlocoTipo =
//   | "tarefas"
//   | "habitos"
//   | "notas"
//   | "lista"
//   | "calendario"
//   | "calculo"
//   | "colecoes";

// export interface CreateNucleoDTO {
//   nome: string;
//   descricao?: string;
//   tipo?: NucleoTipo;
//   corDestaque?: string;
//   imagemCapa?: string;
//   iconId?: string;
// }

// export interface UpdateNucleoDTO extends Partial<CreateNucleoDTO> {}

// export interface CreateBlocoDTO {
//   nucleoId: string;
//   tipo: BlocoTipo;
//   titulo?: string;
//   posicao?: number;
//   configuracoes?: Record<string, any>;
// }

// export interface UpdateBlocoDTO extends Partial<
//   Omit<CreateBlocoDTO, "nucleoId">
// > {
//   id: string;
// }

// export interface ReorderBlocosDTO {
//   nucleoId: string;
//   orders: { id: string; posicao: number }[];
// }
