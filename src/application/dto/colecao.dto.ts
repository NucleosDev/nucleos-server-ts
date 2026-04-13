import { TipoCampo } from "../../domain/entities/Campo";

// ========== COLEÇÃO ==========
export interface CreateColecaoDto {
  blocoId: string;
  nome: string;
}

export interface UpdateColecaoDto {
  nome?: string;
}

export interface ColecaoResponseDto {
  id: string;
  blocoId: string;
  nome: string;
  createdAt: string;
  updatedAt: string;
}

// ========== CAMPO ==========
export interface CreateCampoDto {
  colecaoId: string;
  nome: string;
  tipoCampo: TipoCampo;
}

export interface UpdateCampoDto {
  nome?: string;
  tipoCampo?: TipoCampo;
}

export interface CampoResponseDto {
  id: string;
  colecaoId: string;
  nome: string;
  tipoCampo: TipoCampo;
  createdAt: string;
  updatedAt: string;
}

// ========== ITEM ==========
export interface CreateItemDto {
  colecaoId: string;
  valores: Record<string, any>; // campoId -> valor
}

export interface UpdateItemDto {
  valores: Record<string, any>;
}

export interface ItemResponseDto {
  id: string;
  colecaoId: string;
  valores: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// ========== VALOR ==========
export interface ItemValorResponseDto {
  id: string;
  itemId: string;
  campoId: string;
  valorTexto: string | null;
  valorNumerico: number | null;
  valorData: string | null;
  valorBooleano: boolean | null;
}
