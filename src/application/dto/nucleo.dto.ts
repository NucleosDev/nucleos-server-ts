export interface CreateNucleoDto {
  nome: string;
  descricao?: string;
  tipo?: string;
  corDestaque?: string;
  imagemCapa?: string;
  iconId?: string;
}

export interface UpdateNucleoDto {
  nome?: string;
  descricao?: string;
  tipo?: string;
  corDestaque?: string;
  imagemCapa?: string;
  iconId?: string;
}

export interface NucleoResponseDto {
  id: string;
  userId: string;
  iconId: string | null;
  nome: string;
  descricao: string | null;
  tipo: string;
  corDestaque: string | null;
  imagemCapa: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface NucleoDetailResponseDto extends NucleoResponseDto {
  blocos?: any[];
  calendarioEventos?: any[];
  metas?: any[];
  achievements?: any[];
}

export interface NucleoDTO {
  id: string;
  userId: string;
  iconId: string | null;
  nome: string;
  descricao: string | null;
  tipo: string;
  corDestaque: string | null;
  imagemCapa: string | null;
  createdAt: Date;
  updatedAt: Date;
}