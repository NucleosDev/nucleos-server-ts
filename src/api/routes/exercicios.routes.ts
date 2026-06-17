import { Router } from "express";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";
import { ExerciciosController } from "../controllers/v1/ExerciciosController";
import { CreateTreinoTemplateHandler } from "../../application/commands/exercicios/CreateTreinoTemplateHandler";
import { UpdateTreinoTemplateHandler } from "../../application/commands/exercicios/UpdateTreinoTemplateHandler";
import { DeleteTreinoTemplateHandler } from "../../application/commands/exercicios/DeleteTreinoTemplateHandler";
import { AddExercicioHandler } from "../../application/commands/exercicios/AddExercicioHandler";
import { RemoveExercicioHandler } from "../../application/commands/exercicios/RemoveExercicioHandler";
import { GetTreinosByBlocoHandler } from "../../application/queries/exercicios/GetTreinosByBlocoHandler";
import { ExerciciosRepository } from "../../infrastructure/persistence/repositories/ExerciciosRepository";

const repo = new ExerciciosRepository();

const createTemplateHandler = new CreateTreinoTemplateHandler(repo);
const updateTemplateHandler = new UpdateTreinoTemplateHandler(repo);
const deleteTemplateHandler = new DeleteTreinoTemplateHandler(repo);
const addExercicioHandler = new AddExercicioHandler(repo);
const removeExercicioHandler = new RemoveExercicioHandler(repo);
const getTreinosByBlocoHandler = new GetTreinosByBlocoHandler(repo);

const controller = new ExerciciosController(
  createTemplateHandler,
  updateTemplateHandler,
  deleteTemplateHandler,
  addExercicioHandler,
  removeExercicioHandler,
  getTreinosByBlocoHandler,
);

export const exerciciosRoutes = Router();
exerciciosRoutes.use(authenticate);

// Treino templates
exerciciosRoutes.get("/bloco/:blocoId", (req, res, next) => {
  controller.listByBloco(req as AuthRequest, res).catch(next);
});

exerciciosRoutes.post("/", (req, res, next) => {
  controller.createTemplate(req as AuthRequest, res).catch(next);
});

exerciciosRoutes.put("/:id", (req, res, next) => {
  controller.updateTemplate(req as AuthRequest, res).catch(next);
});

exerciciosRoutes.delete("/:id", (req, res, next) => {
  controller.deleteTemplate(req as AuthRequest, res).catch(next);
});

// Exercises within a template
exerciciosRoutes.post("/:templateId/exercicios", (req, res, next) => {
  controller.addExercicio(req as AuthRequest, res).catch(next);
});

exerciciosRoutes.delete("/exercicios/:exercicioId", (req, res, next) => {
  controller.removeExercicio(req as AuthRequest, res).catch(next);
});
