import { UserLevelRepository } from "../../../infrastructure/persistence/repositories/UserLevelRepository";
import { GetUserLevelQuery } from "./get-user-level.query";

export class GetUserLevelHandler {
  private repo: UserLevelRepository;

  constructor() {
    this.repo = new UserLevelRepository();
  }

  async execute(query: GetUserLevelQuery) {
    return this.repo.findByUserId(query.userId);
  }
}
