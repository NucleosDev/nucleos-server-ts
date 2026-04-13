export class EnergyLog {
  id: string;
  userId: string | null;
  nucleoId: string | null;
  energyAmount: number;
  createdAt: Date;

  constructor(params: {
    userId?: string;
    nucleoId?: string;
    energyAmount: number;
  }) {
    this.id = crypto.randomUUID();
    this.userId = params.userId ?? null;
    this.nucleoId = params.nucleoId ?? null;
    this.energyAmount = params.energyAmount;
    this.createdAt = new Date();
  }
}
