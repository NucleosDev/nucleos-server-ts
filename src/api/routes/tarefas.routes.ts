// src/api/routes/tarefas.routes.ts
import { Router } from "express";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";
import { TarefasController } from "../controllers/v1/TarefasController";
import { CreateTarefaHandler } from "../../application/commands/tarefas/CreateTarefaHandler";
import { UpdateTarefaHandler } from "../../application/commands/tarefas/UpdateTarefaHandler";
import { ConcluirTarefaHandler } from "../../application/commands/tarefas/ConcluirTarefaHandler";
import { DeleteTarefaHandler } from "../../application/commands/tarefas/DeleteTarefaHandler";
import { GetTarefasByBlocoHandler } from "../../application/queries/tarefas/GetTarefasByBlocoHandler";
import { GetTarefasVencendoHandler } from "../../application/queries/tarefas/GetTarefasVencendoHandler";
import { TarefaRepository } from "../../infrastructure/persistence/repositories/TarefaRepository";

const tarefaRepository = new TarefaRepository();

const createTarefaHandler = new CreateTarefaHandler(tarefaRepository);
const updateTarefaHandler = new UpdateTarefaHandler(tarefaRepository);
const concluirTarefaHandler = new ConcluirTarefaHandler(tarefaRepository);
const deleteTarefaHandler = new DeleteTarefaHandler(tarefaRepository);
const getTarefasByBlocoHandler = new GetTarefasByBlocoHandler(tarefaRepository);
const getTarefasVencendoHandler = new GetTarefasVencendoHandler(tarefaRepository);

const tarefasController = new TarefasController(
  createTarefaHandler,
  updateTarefaHandler,
  concluirTarefaHandler,
  deleteTarefaHandler,
  getTarefasByBlocoHandler,
  getTarefasVencendoHandler,
);

export const tarefasRoutes = Router();

tarefasRoutes.get("/bloco/:blocoId", authenticate, (req, res, next) => {
  tarefasController.listByBloco(req as AuthRequest, res).catch(next);
});

tarefasRoutes.get("/vencendo", authenticate, (req, res, next) => {
  tarefasController.listVencendo(req as AuthRequest, res).catch(next);
});

tarefasRoutes.put("/:id", authenticate, (req, res, next) => {
  tarefasController.update(req as AuthRequest, res).catch(next);
});

tarefasRoutes.post("/:id/concluir", authenticate, (req, res, next) => {
  tarefasController.concluir(req as AuthRequest, res).catch(next);
});

tarefasRoutes.post("/", authenticate, (req, res, next) => {
  tarefasController.create(req as AuthRequest, res).catch(next);
});

tarefasRoutes.delete("/:id", authenticate, (req, res, next) => {
  tarefasController.delete(req as AuthRequest, res).catch(next);
});
