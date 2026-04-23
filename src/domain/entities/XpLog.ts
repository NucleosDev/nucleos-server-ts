import { BaseEntity } from "./base.entity";

export class XpLog extends BaseEntity {
  userId: string;
  nucleoId: string | null;
  xpAmount: number;
  source: string;
  metadata: Record<string, any> | null;

  constructor(
    userId: string,
    xpAmount: number,
    source: string,
    nucleoId: string | null = null,
    metadata: Record<string, any> | null = null,
  ) {
    super();
    this.id = crypto.randomUUID();
    this.userId = userId;
    this.xpAmount = xpAmount;
    this.source = source;
    this.nucleoId = nucleoId;
    this.metadata = metadata;
    this.createdAt = new Date();
  }

  static fromDatabase(data: any): XpLog {
    const entity = new XpLog(
      data.user_id,
      data.xp_amount,
      data.source,
      data.nucleo_id,
      data.metadata,
    );
    entity.id = data.id;
    entity.createdAt = data.created_at;
    return entity;
  }

  toDatabase(): any {
    return {
      id: this.id,
      user_id: this.userId,
      nucleo_id: this.nucleoId,
      xp_amount: this.xpAmount,
      source: this.source,
      metadata: this.metadata,
      created_at: this.createdAt,
    };
  }
}
