import { Router } from "express";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";
import { BlocosController } from "../controllers/v1/BlocosController";
import { CreateBlocoHandler } from "../../application/commands/blocos/CreateBlocoHandler";
import { UpdateBlocoHandler } from "../../application/commands/blocos/UpdateBlocoHandler";
import { DeleteBlocoHandler } from "../../application/commands/blocos/DeleteBlocoHandler";
import { ReorderBlocosHandler } from "../../application/commands/blocos/ReorderBlocosHandler";
import { GetBlocosByNucleoHandler } from "../../application/queries/blocos/GetBlocosByNucleoHandler";
import { GetBlocoByIdHandler } from "../../application/queries/blocos/GetBlocoByIdHandler";
import { BlocoRepository } from "../../infrastructure/persistence/repositories/BlocoRepository";
import { CurrentUserService } from "../../infrastructure/services/current-user.service";

// Instanciar dependências
const blocoRepository = new BlocoRepository();
const currentUserService = new CurrentUserService();

// Handlers
const createBlocoHandler = new CreateBlocoHandler(
  blocoRepository,
  currentUserService,
);
const updateBlocoHandler = new UpdateBlocoHandler(
  blocoRepository,
  currentUserService,
);
const deleteBlocoHandler = new DeleteBlocoHandler(
  blocoRepository,
  currentUserService,
);
const reorderBlocosHandler = new ReorderBlocosHandler(
  blocoRepository,
  currentUserService,
);
const getBlocosByNucleoHandler = new GetBlocosByNucleoHandler(
  blocoRepository,
  currentUserService,
);
const getBlocoByIdHandler = new GetBlocoByIdHandler(
  blocoRepository,
  currentUserService,
);

// Controller
const blocosController = new BlocosController(
  createBlocoHandler,
  updateBlocoHandler,
  deleteBlocoHandler,
  reorderBlocosHandler,
  getBlocosByNucleoHandler,
  getBlocoByIdHandler,
);

export const blocosRoutes = Router();

// teste: arrow functions com type assertion
blocosRoutes.get("/nucleo/:nucleoId", authenticate, (req, res, next) => {
  blocosController.getByNucleo(req as AuthRequest, res).catch(next);
});

blocosRoutes.get("/:id", authenticate, (req, res, next) => {
  blocosController.getById(req as AuthRequest, res).catch(next);
});

blocosRoutes.post("/", authenticate, (req, res, next) => {
  blocosController.create(req as AuthRequest, res).catch(next);
});

blocosRoutes.put("/:id", authenticate, (req, res, next) => {
  blocosController.update(req as AuthRequest, res).catch(next);
});

blocosRoutes.delete("/:id", authenticate, (req, res, next) => {
  blocosController.delete(req as AuthRequest, res).catch(next);
});

blocosRoutes.put("/reorder", authenticate, (req, res, next) => {
  blocosController.reorder(req as AuthRequest, res).catch(next);
});
