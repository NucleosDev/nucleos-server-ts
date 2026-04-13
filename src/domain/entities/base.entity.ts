export abstract class BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor() {
    this.id = crypto.randomUUID();
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.deletedAt = null;
  }

  softDelete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  updateTimestamp(): void {
    this.updatedAt = new Date();
  }
}