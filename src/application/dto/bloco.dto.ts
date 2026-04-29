export interface CreateBlocoDto {
  nucleoId: string;
  tipo: string;
  titulo?: string;
  posicao?: number;
  configuracoes?: Record<string, any>;
  //novos
  parentId?: string | null;
  path?: string | null;
  depth?: number;
  isCanvas?: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface UpdateBlocoDto {
  titulo?: string;
  tipo?: string;
  posicao?: number;
  configuracoes?: Record<string, any>;
  // novo
  parentId?: string | null;
}

export interface BlocoResponseDto {
  id: string;
  nucleoId: string;
  tipo: string;
  titulo: string | null;
  posicao: number;
  configuracoes: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  // novo
  parentId?: string | null;
  path?: string | null;
  depth?: number;
  isCanvas?: boolean;
}

export interface ReorderBlocosDto {
  nucleoId: string;
  orders: { id: string; posicao: number }[];
  // novo
  parentId?: string | null;
}
