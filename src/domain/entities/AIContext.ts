export class AIContext {
  id: string;
  userId: string;
  lastSummary: string | null;
  preferredStyle: string | null;
  lastInteraction: Date | null;
  updatedAt: Date;

  constructor(params: { userId: string }) {
    this.id = crypto.randomUUID();
    this.userId = params.userId;
    this.lastSummary = null;
    this.preferredStyle = null;
    this.lastInteraction = null;
    this.updatedAt = new Date();
  }
}
