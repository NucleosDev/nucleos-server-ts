// application/commands/timers/start-timer.command.ts
import { IRequest } from '../../common/mediator/mediator';
import { TimerDto } from '../../dto/timer.dto';

export interface StartTimerCommand extends IRequest<TimerDto> {
  nucleoId: string;
  userId: string;
  titulo?: string;
}