import { TipoBloco } from "../../domain/value-objects/TipoBloco";

export interface CreateBlocoDto {
  nucleoId: string;
  tipo: TipoBloco;
  titulo?: string;
  posicao?: number;
  configuracoes?: Record<string, any>;
}

export interface UpdateBlocoDto {
  titulo?: string;
  tipo?: TipoBloco;
  posicao?: number;
  configuracoes?: Record<string, any>;
}

export interface BlocoResponseDto {
  id: string;
  nucleoId: string;
  tipo: TipoBloco;
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
