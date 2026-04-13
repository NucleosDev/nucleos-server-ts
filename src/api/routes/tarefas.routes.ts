import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { AuthRequest } from "../middlewares/auth.middleware";
import { TarefasController } from "../controllers/v1/TarefasController";
import { CreateTarefaHandler } from "../../application/commands/tarefas/CreateTarefaHandler";
import { ConcluirTarefaHandler } from "../../application/commands/tarefas/ConcluirTarefaHandler";
import { DeleteTarefaHandler } from "../../application/commands/tarefas/DeleteTarefaHandler";
import { GetTarefasByBlocoHandler } from "../../application/queries/tarefas/GetTarefasByBlocoHandler";
import { GetTarefasVencendoHandler } from "../../application/queries/tarefas/GetTarefasVencendoHandler";
import { TarefaRepository } from "../../infrastructure/persistence/repositories/TarefaRepository";
import { CurrentUserService } from "../../infrastructure/services/current-user.service";

const tarefaRepository = new TarefaRepository();
const currentUserService = new CurrentUserService();

const createTarefaHandler = new CreateTarefaHandler(
  tarefaRepository,
  currentUserService,
);
const concluirTarefaHandler = new ConcluirTarefaHandler(
  tarefaRepository,
  currentUserService,
);
const deleteTarefaHandler = new DeleteTarefaHandler(
  tarefaRepository,
  currentUserService,
);
const getTarefasByBlocoHandler = new GetTarefasByBlocoHandler(tarefaRepository);
const getTarefasVencendoHandler = new GetTarefasVencendoHandler(
  tarefaRepository,
  currentUserService,
);

const tarefasController = new TarefasController(
  createTarefaHandler,
  concluirTarefaHandler,
  deleteTarefaHandler,
  getTarefasByBlocoHandler,
  getTarefasVencendoHandler,
);

export const tarefasRoutes = Router();

// 🔥 Arrow functions com type assertion (igual ao padrão dos blocos)
tarefasRoutes.get("/bloco/:blocoId", authenticate, (req, res, next) => {
  tarefasController.listByBloco(req as AuthRequest, res).catch(next);
});

tarefasRoutes.get("/vencendo", authenticate, (req, res, next) => {
  tarefasController.listVencendo(req as AuthRequest, res).catch(next);
});

tarefasRoutes.post("/", authenticate, (req, res, next) => {
  tarefasController.create(req as AuthRequest, res).catch(next);
});

tarefasRoutes.patch("/:id/concluir", authenticate, (req, res, next) => {
  tarefasController.concluir(req as AuthRequest, res).catch(next);
});

tarefasRoutes.delete("/:id", authenticate, (req, res, next) => {
  tarefasController.delete(req as AuthRequest, res).catch(next);
});
