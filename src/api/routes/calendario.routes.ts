import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { CalendarioController } from "../controllers/v1/CalendarioController";
import { CalendarioRepository } from "../../infrastructure/persistence/repositories/CalendarioRepository";
import { NucleoRepository } from "../../infrastructure/persistence/repositories/NucleoRepository";
import { CreateEventoHandler } from "../../application/commands/calendario/CreateEventoHandler";
import { UpdateEventoHandler } from "../../application/commands/calendario/UpdateEventoHandler";
import { DeleteEventoHandler } from "../../application/commands/calendario/DeleteEventoHandler";
import { GetEventosByNucleoHandler } from "../../application/queries/calendario/GetEventosByNucleoHandler";
import { GetEventoByIdHandler } from "../../application/queries/calendario/GetEventoByIdHandler";

const calendarioRepository = new CalendarioRepository();
const nucleoRepository = new NucleoRepository();

const createHandler = new CreateEventoHandler(
  calendarioRepository,
  nucleoRepository,
);
const updateHandler = new UpdateEventoHandler(
  calendarioRepository,
  nucleoRepository,
);
const deleteHandler = new DeleteEventoHandler(
  calendarioRepository,
  nucleoRepository,
);
const listByNucleoHandler = new GetEventosByNucleoHandler(
  calendarioRepository,
  nucleoRepository,
);
const getByIdHandler = new GetEventoByIdHandler(
  calendarioRepository,
  nucleoRepository,
);

const calendarioController = new CalendarioController(
  createHandler,
  updateHandler,
  deleteHandler,
  listByNucleoHandler,
  getByIdHandler,
);

export const calendarioRoutes = Router();

calendarioRoutes.use(authenticate);

calendarioRoutes.get("/nucleo/:nucleoId", (req, res, next) => {
  calendarioController.getByNucleo(req as any, res).catch(next);
});
calendarioRoutes.get("/:id", (req, res, next) => {
  calendarioController.getById(req as any, res).catch(next);
});
calendarioRoutes.post("/", (req, res, next) => {
  calendarioController.create(req as any, res).catch(next);
});
calendarioRoutes.put("/:id", (req, res, next) => {
  calendarioController.update(req as any, res).catch(next);
});
calendarioRoutes.delete("/:id", (req, res, next) => {
  calendarioController.delete(req as any, res).catch(next);
});
