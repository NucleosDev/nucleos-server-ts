// application/dto/colecao.dto.ts
import { TipoCampo } from "../../domain/entities/Campo";

//  COLEÇÃO
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

//  CAMPO
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

//  ITEM
export interface CreateItemDto {
  colecaoId: string;
  valores: Record<string, any>;
}

export interface UpdateItemDto {
  valores: Record<string, any>;
}

export interface ItemResponseDto {
  id: string;
  colecaoId: string;
  createdAt: string;
  updatedAt: string;
}

//
export interface ItemComValoresResponseDto extends ItemResponseDto {
  valores: Record<string, any>;
}

//  VALOR
export interface ItemValorResponseDto {
  id: string;
  itemId: string;
  campoId: string;
  valorTexto: string | null;
  valorNumerico: number | null;
  valorData: string | null;
  valorBooleano: boolean | null;
}
