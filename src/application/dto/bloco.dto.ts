export interface CreateBlocoDto {
  nucleoId: string;
  tipo: string; // String (validado com isTipoBloco)
  titulo?: string;
  posicao?: number;
  configuracoes?: Record<string, any>;
}

export interface UpdateBlocoDto {
  titulo?: string;
  tipo?: string;
  posicao?: number;
  configuracoes?: Record<string, any>;
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
}

export interface ReorderBlocosDto {
  nucleoId: string;
  orders: { id: string; posicao: number }[];
}
