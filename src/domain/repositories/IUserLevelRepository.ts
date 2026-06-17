import { UserLevel } from "../entities/UserLevel.js";

export interface IUserLevelRepository {
  findByUserId(userId: string): Promise<UserLevel | null>;
  save(level: UserLevel): Promise<void>;
  update(level: UserLevel): Promise<void>;
}
