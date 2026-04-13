import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { AuthRequest } from "../middlewares/auth.middleware";
import { CalendarioController } from "../controllers/v1/CalendarioController";
import { CreateEventoHandler } from "../../application/commands/calendario/CreateEventoHandler";
import { UpdateEventoHandler } from "../../application/commands/calendario/UpdateEventoHandler";
import { DeleteEventoHandler } from "../../application/commands/calendario/DeleteEventoHandler";
import { GetEventosByNucleoHandler } from "../../application/queries/calendario/GetEventosByNucleoHandler";
import { GetEventoByIdHandler } from "../../application/queries/calendario/GetEventoByIdHandler";
import { CalendarioRepository } from "../../infrastructure/persistence/repositories/CalendarioRepository";
import { CurrentUserService } from "../../infrastructure/services/current-user.service";

const calendarioRepository = new CalendarioRepository();
const currentUserService = new CurrentUserService();

const createEventoHandler = new CreateEventoHandler(
  calendarioRepository,
  currentUserService,
);
const updateEventoHandler = new UpdateEventoHandler(
  calendarioRepository,
  currentUserService,
);
const deleteEventoHandler = new DeleteEventoHandler(
  calendarioRepository,
  currentUserService,
);
const getEventosByNucleoHandler = new GetEventosByNucleoHandler(
  calendarioRepository,
);
const getEventoByIdHandler = new GetEventoByIdHandler(calendarioRepository);

const calendarioController = new CalendarioController(
  createEventoHandler,
  updateEventoHandler,
  deleteEventoHandler,
  getEventosByNucleoHandler,
  getEventoByIdHandler,
);

export const calendarioRoutes = Router();

calendarioRoutes.get("/nucleo/:nucleoId", authenticate, (req, res, next) => {
  calendarioController.listByNucleo(req as AuthRequest, res).catch(next);
});

calendarioRoutes.get("/:id", authenticate, (req, res, next) => {
  calendarioController.getById(req as AuthRequest, res).catch(next);
});

calendarioRoutes.post("/", authenticate, (req, res, next) => {
  calendarioController.create(req as AuthRequest, res).catch(next);
});

calendarioRoutes.put("/:id", authenticate, (req, res, next) => {
  calendarioController.update(req as AuthRequest, res).catch(next);
});

calendarioRoutes.delete("/:id", authenticate, (req, res, next) => {
  calendarioController.delete(req as AuthRequest, res).catch(next);
});
