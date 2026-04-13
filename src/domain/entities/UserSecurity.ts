export class UserSecurity {
  id: string;
  userId: string;
  lastLogin: Date | null;
  failedAttempts: number;
  passwordUpdatedAt: Date;

  constructor(params: { userId: string }) {
    this.id = crypto.randomUUID();
    this.userId = params.userId;
    this.lastLogin = null;
    this.failedAttempts = 0;
    this.passwordUpdatedAt = new Date();
  }
}
