export class XpLog {
  id: string;
  userId: string | null;
  nucleoId: string | null;
  xpAmount: number;
  source: string;
  createdAt: Date;

  constructor(params: {
    userId?: string;
    nucleoId?: string;
    xpAmount: number;
    source: string;
  }) {
    this.id = crypto.randomUUID();
    this.userId = params.userId ?? null;
    this.nucleoId = params.nucleoId ?? null;
    this.xpAmount = params.xpAmount;
    this.source = params.source;
    this.createdAt = new Date();
  }
}
