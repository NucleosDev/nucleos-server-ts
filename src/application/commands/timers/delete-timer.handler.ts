import { TimerRepository } from "../../../infrastructure/persistence/repositories/TimerRepository";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { DeleteTimerCommand } from "./delete-timer.command";

export class DeleteTimerHandler {
  private timerRepository: TimerRepository;

  constructor() {
    this.timerRepository = new TimerRepository();
  }

  async execute(command: DeleteTimerCommand): Promise<void> {
    const deleted = await this.timerRepository.delete(
      command.id,
      command.userId,
    );

    if (!deleted) {
      throw new NotFoundException("Timer", command.id);
    }
  }
}
