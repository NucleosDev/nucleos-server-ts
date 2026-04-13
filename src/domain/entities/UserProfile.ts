export class UserProfile {
  id: string;
  userId: string;
  fullName: string;
  nickname: string;
  avatarUrl: string;
  createdAt: Date;

  constructor(params: {
    userId: string;
    fullName: string;
    nickname: string;
    avatarUrl?: string;
  }) {
    this.id = crypto.randomUUID();
    this.userId = params.userId;
    this.fullName = params.fullName;
    this.nickname = params.nickname;
    this.avatarUrl = params.avatarUrl || "";
    this.createdAt = new Date();
  }
}
