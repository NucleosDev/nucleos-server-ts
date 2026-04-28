// src/api/routes/blocos.routes.ts
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
import { NucleoRepository } from "../../infrastructure/persistence/repositories/NucleoRepository";

const blocoRepository = new BlocoRepository();
const nucleoRepository = new NucleoRepository();

const createBlocoHandler = new CreateBlocoHandler(
  blocoRepository,
  nucleoRepository,
);
const updateBlocoHandler = new UpdateBlocoHandler(blocoRepository);
const deleteBlocoHandler = new DeleteBlocoHandler(blocoRepository);
const reorderBlocosHandler = new ReorderBlocosHandler(blocoRepository);
const getBlocosByNucleoHandler = new GetBlocosByNucleoHandler(blocoRepository);
const getBlocoByIdHandler = new GetBlocoByIdHandler(blocoRepository);

const blocosController = new BlocosController(
  createBlocoHandler,
  updateBlocoHandler,
  deleteBlocoHandler,
  reorderBlocosHandler,
  getBlocosByNucleoHandler,
  getBlocoByIdHandler,
  blocoRepository, // NOVO
);

const router = Router();

router.get("/blocos/ping", (req, res) => {
  res.json({ message: "pong", timestamp: new Date().toISOString() });
});

router.use(authenticate);

// Rotas existentes
router.get("/blocos/nucleo/:nucleoId", (req, res, next) => {
  blocosController.getByNucleo(req as AuthRequest, res).catch(next);
});

router.get("/blocos/:id", (req, res, next) => {
  blocosController.getById(req as AuthRequest, res).catch(next);
});

router.post("/blocos", (req, res, next) => {
  blocosController.create(req as AuthRequest, res).catch(next);
});

router.put("/blocos/:id", (req, res, next) => {
  blocosController.update(req as AuthRequest, res).catch(next);
});

router.delete("/blocos/:id", (req, res, next) => {
  blocosController.delete(req as AuthRequest, res).catch(next);
});

router.post("/blocos/reorder", (req, res, next) => {
  blocosController.reorder(req as AuthRequest, res).catch(next);
});

// NOVAS ROTAS
router.get("/blocos/parent/:parentId", (req, res, next) => {
  blocosController.getChildren(req as AuthRequest, res).catch(next);
});

router.get("/blocos/:id/ancestors", (req, res, next) => {
  blocosController.getAncestors(req as AuthRequest, res).catch(next);
});

router.put("/blocos/:id/move", (req, res, next) => {
  blocosController.move(req as AuthRequest, res).catch(next);
});

router.get("/blocos/canvas/:nucleoId", (req, res, next) => {
  blocosController.getCanvasByNucleo(req as AuthRequest, res).catch(next);
});

router.put("/blocos/canvas/:nucleoId", (req, res, next) => {
  blocosController.saveCanvasContent(req as AuthRequest, res).catch(next);
});

export { router };
