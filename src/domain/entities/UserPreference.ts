export class UserPreference {
  userId: string;
  theme: string;
  language: string;
  notifications: string;
  shortcuts: string;
  dashboardLayout: string;
  updatedAt: Date;

  constructor(params: { userId: string }) {
    this.userId = params.userId;
    this.theme = "system";
    this.language = "pt-BR";
    this.notifications = JSON.stringify({
      push: true,
      email: true,
      streaks: true,
    });
    this.shortcuts = "{}";
    this.dashboardLayout = "{}";
    this.updatedAt = new Date();
  }
}
