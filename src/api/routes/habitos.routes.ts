// src/api/routes/habitos.routes.ts
import { Router } from "express";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";
import { HabitosController } from "../controllers/v1/HabitosController";
import { CreateHabitoHandler } from "../../application/commands/habitos/CreateHabitoHandler";
import { UpdateHabitoHandler } from "../../application/commands/habitos/UpdateHabitoHandler";
import { RegistrarHabitoHandler } from "../../application/commands/habitos/RegistrarHabitoHandler";
import { DeleteHabitoHandler } from "../../application/commands/habitos/DeleteHabitoHandler";
import { GetHabitosByBlocoHandler } from "../../application/queries/habitos/GetHabitosByBlocoHandler";
import { HabitoRepository } from "../../infrastructure/persistence/repositories/HabitoRepository";

const habitoRepository = new HabitoRepository();

const createHabitoHandler = new CreateHabitoHandler(habitoRepository);
const updateHabitoHandler = new UpdateHabitoHandler(habitoRepository);
const registrarHabitoHandler = new RegistrarHabitoHandler(habitoRepository);
const deleteHabitoHandler = new DeleteHabitoHandler(habitoRepository);
const getHabitosByBlocoHandler = new GetHabitosByBlocoHandler(habitoRepository);

const habitosController = new HabitosController(
  createHabitoHandler,
  updateHabitoHandler,
  registrarHabitoHandler,
  deleteHabitoHandler,
  getHabitosByBlocoHandler,
);

export const habitosRoutes = Router();

habitosRoutes.use(authenticate);

habitosRoutes.get("/bloco/:blocoId", (req, res, next) => {
  habitosController.listByBloco(req as AuthRequest, res).catch(next);
});

habitosRoutes.post("/", (req, res, next) => {
  habitosController.create(req as AuthRequest, res).catch(next);
});

habitosRoutes.put("/:id", (req, res, next) => {
  habitosController.update(req as AuthRequest, res).catch(next);
});

habitosRoutes.post("/:id/registrar", (req, res, next) => {
  habitosController.registrar(req as AuthRequest, res).catch(next);
});

habitosRoutes.delete("/:id", (req, res, next) => {
  habitosController.delete(req as AuthRequest, res).catch(next);
});
