export interface InsightDto {
  id: string;
  userId: string;
  nucleoId: string | null;
  insightType: string;
  mensagem: string;
  priority: number;
  applied: boolean;
  createdAt: Date;
}

export interface GerarInsightDto {
  nucleoId?: string;
}

export interface ChatMessageDto {
  mensagem: string;
  resposta: string;
}