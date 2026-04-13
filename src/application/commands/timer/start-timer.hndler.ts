// // application/commands/timers/start-timer.handler.ts
// import { IRequestHandler } from '../../common/mediator/mediator';
// import { StartTimerCommand } from './start-timer.command';
// import { TimerDto } from '../../dto/timer.dto';
// import { Timer } from '../../../domain/entities/Timer';
// import { TimerRepository } from '../../../infrastructure/persistence/repositories/timer.repository';
// import { NucleoRepository } from '../../../infrastructure/persistence/repositories/nucleo.repository';
// import { UnitOfWork } from '../../../infrastructure/persistence/unit-of-work/unit-of-work';
// import { pool } from '../../../infrastructure/persistence/db/connection';
// import { NotFoundException } from '../../common/exceptions/not-found.exception';
// import { ForbiddenException } from '../../common/exceptions/forbidden.exception';

// export class StartTimerHandler implements IRequestHandler<StartTimerCommand, TimerDto> {
//   private timerRepository: TimerRepository;
//   private nucleoRepository: NucleoRepository;
//   private uow: UnitOfWork;

//   constructor() {
//     this.timerRepository = new TimerRepository();
//     this.nucleoRepository = new NucleoRepository();
//     this.uow = new UnitOfWork(pool);
//   }

//   async handle(request: StartTimerCommand): Promise<TimerDto> {
//     return this.uow.executeInTransaction(async () => {
//       const nucleo = await this.nucleoRepository.findById(request.nucleoId);
      
//       if (!nucleo) {
//         throw new NotFoundException('Núcleo', request.nucleoId);
//       }
      
//       if (nucleo.userId !== request.userId) {
//         throw new ForbiddenException('Você não tem permissão para criar timers neste núcleo');
//       }

//       // Verificar se já existe timer ativo
//       const activeTimer = await this.timerRepository.findActiveByNucleoId(request.nucleoId);
//       if (activeTimer) {
//         throw new Error('Já existe um timer ativo para este núcleo');
//       }

//       const timer = new Timer(
//         request.nucleoId,
//         request.titulo,
//         new Date(),
//         null,
//         null
//       );

//       const saved = await this.timerRepository.create(timer);

//       return {
//         id: saved.id,
//         nucleoId: saved.nucleoId,
//         titulo: saved.titulo,
//         inicio: saved.inicio,
//         fim: saved.fim,
//         duracaoSegundos: saved.duracaoSegundos,
//         createdAt: saved.createdAt,
//         updatedAt: saved.updatedAt
//       };
//     });
//   }
// }