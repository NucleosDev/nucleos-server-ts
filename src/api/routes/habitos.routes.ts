import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { AuthRequest } from "../middlewares/auth.middleware";
import { HabitosController } from "../controllers/v1/HabitosController";
import { CreateHabitoHandler } from "../../application/commands/habitos/CreateHabitoHandler";
import { RegistrarHabitoHandler } from "../../application/commands/habitos/RegistrarHabitoHandler";
import { DeleteHabitoHandler } from "../../application/commands/habitos/DeleteHabitoHandler";
import { GetHabitosByBlocoHandler } from "../../application/queries/habitos/GetHabitosByBlocoHandler";
import { HabitoRepository } from "../../infrastructure/persistence/repositories/HabitoRepository";
import { CurrentUserService } from "../../infrastructure/services/current-user.service";

const habitoRepository = new HabitoRepository();
const currentUserService = new CurrentUserService();

const createHabitoHandler = new CreateHabitoHandler(
  habitoRepository,
  currentUserService,
);
const registrarHabitoHandler = new RegistrarHabitoHandler(
  habitoRepository,
  currentUserService,
);
const deleteHabitoHandler = new DeleteHabitoHandler(
  habitoRepository,
  currentUserService,
);
const getHabitosByBlocoHandler = new GetHabitosByBlocoHandler(habitoRepository);

const habitosController = new HabitosController(
  createHabitoHandler,
  registrarHabitoHandler,
  deleteHabitoHandler,
  getHabitosByBlocoHandler,
);

export const habitosRoutes = Router();

habitosRoutes.get("/bloco/:blocoId", authenticate, (req, res, next) => {
  habitosController.listByBloco(req as AuthRequest, res).catch(next);
});

habitosRoutes.post("/", authenticate, (req, res, next) => {
  habitosController.create(req as AuthRequest, res).catch(next);
});

habitosRoutes.post("/:id/registrar", authenticate, (req, res, next) => {
  habitosController.registrar(req as AuthRequest, res).catch(next);
});

habitosRoutes.delete("/:id", authenticate, (req, res, next) => {
  habitosController.delete(req as AuthRequest, res).catch(next);
});
