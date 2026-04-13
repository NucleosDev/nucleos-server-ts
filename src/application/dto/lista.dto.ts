export type TipoLista = "generica" | "compras" | "financeiro";

export interface CreateListaDto {
  blocoId: string;
  nome: string;
  tipoLista?: TipoLista;
}

export interface UpdateListaDto {
  nome?: string;
  tipoLista?: TipoLista;
}

export interface ListaResponseDto {
  id: string;
  blocoId: string;
  nome: string;
  tipoLista: TipoLista;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemListaDto {
  listaId: string;
  nome: string;
  quantidade?: number;
  valorUnitario?: number;
  categoriaId?: string;
}

export interface UpdateItemListaDto {
  nome?: string;
  quantidade?: number;
  valorUnitario?: number | null;
  checked?: boolean;
  categoriaId?: string | null;
}

export interface ItemListaResponseDto {
  id: string;
  listaId: string;
  categoriaId: string | null;
  categoriaNome?: string | null;
  categoriaCor?: string | null;
  nome: string;
  quantidade: number;
  valorUnitario: number | null;
  valorTotal: number | null;
  checked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoriaDto {
  listaId: string;
  nome: string;
  cor?: string;
}

export interface CategoriaResponseDto { 
  id: string;
  listaId: string;
  nome: string;
  cor: string | null;
  createdAt: string;
}
