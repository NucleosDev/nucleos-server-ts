// // infrastructure/di/timer-handlers.registry.ts
// import { mediator } from "../../application/common/mediator/mediator";

// // Commands
// import { StartTimerCommand } from "../../application/commands/timers/start-timer.command";
// import { StopTimerCommand } from "../../application/commands/timers/stop-timer.command";
// import { DeleteTimerCommand } from "../../application/commands/timers/delete-timer.command";

// // Queries
// import { GetTimersByNucleoQuery } from "../../application/queries/timers/get-timers-by-nucleo.query";

// // Handlers
// import { StartTimerHandler } from "../../application/commands/timers/start-timer.handler";
// import { StopTimerHandler } from "../../application/commands/timers/stop-timer.handler";
// import { DeleteTimerHandler } from "../../application/commands/timers/delete-timer.handler";
// import { GetTimersByNucleoHandler } from "../../application/queries/timers/get-timers-by-nucleo.handler";

// export function registerTimerHandlers(): void {
//   mediator.register("StartTimerCommand", new StartTimerHandler());
//   mediator.register("StopTimerCommand", new StopTimerHandler());
//   mediator.register("DeleteTimerCommand", new DeleteTimerHandler());
//   mediator.register("GetTimersByNucleoQuery", new GetTimersByNucleoHandler());
// }
