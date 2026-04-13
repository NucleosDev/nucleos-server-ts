export interface CreateNucleoDto {
  nome: string;
  descricao?: string;
  categoria?: string;
  tipo?: string;
  corDestaque?: string;
  imagemCapa?: string;
  iconId?: string;
}

export interface UpdateNucleoDto {
  nome?: string;
  descricao?: string;
  corDestaque?: string;
  imagemCapa?: string;
  tipo?: string;
  iconId?: string;
}

export interface NucleoResponseDto {
  id: string;
  userId: string;
  nome: string;
  descricao: string | null;
  corDestaque: string | null;
  tipo: string | null;
  imagemCapa: string | null;
  iconId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  xp?: number;
  level?: number;
  energy?: number;
}

export interface NucleoDetailResponseDto {
  id: string;
  userId: string;
  iconId: string | null;
  nome: string;
  descricao: string | null;
  corDestaque: string | null;
  tipo: string | null;
  imagemCapa: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  xp?: number;
  level?: number;
  energy?: number;
  blocos?: any[];
}

export type NucleoDTO = NucleoResponseDto;

export interface NucleoDetailResponseDto {
  id: string;
  userId: string;
  iconId: string | null;
  nome: string;
  descricao: string | null;
  tipo: string | null;
  corDestaque: string | null;
  imagemCapa: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  blocos?: any[];
}
