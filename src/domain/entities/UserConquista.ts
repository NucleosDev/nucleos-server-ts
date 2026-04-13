export class UserConquista {
  id: string;
  userId: string;
  conquistaId: string;
  desbloqueadoEm: Date;

  constructor(params: { userId: string; conquistaId: string }) {
    this.id = crypto.randomUUID();
    this.userId = params.userId;
    this.conquistaId = params.conquistaId;
    this.desbloqueadoEm = new Date();
  }
}
