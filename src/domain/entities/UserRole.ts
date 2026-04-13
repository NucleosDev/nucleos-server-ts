export class UserRole {
  id: string;
  userId: string;
  role: string;

  constructor(params: { userId: string; role: string }) {
    this.id = crypto.randomUUID();
    this.userId = params.userId;
    this.role = params.role;
  }
}
