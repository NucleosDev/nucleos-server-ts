export interface ICurrentUserService {
  getUserId(): string | null;
  getEmail(): string | null;
  getRole(): string | null;
  isAuthenticated(): boolean;
  hasPermission(permission: string): boolean;
}