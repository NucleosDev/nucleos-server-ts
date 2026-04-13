import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { NucleosController } from "../../api/controllers/v1/NucleosController";
import { CreateNucleoHandler } from "../../application/commands/nucleos/CreateNucleoHandler";
import { UpdateNucleoHandler } from "../../application/commands/nucleos/UpdateNucleoHandler";
import { DeleteNucleoHandler } from "../../application/commands/nucleos/DeleteNucleoHandler";
import { GetNucleosHandler } from "../../application/queries/nucleos/GetNucleosHandler";
import { GetNucleoByIdHandler } from "../../application/queries/nucleos/GetNucleoByIdHandler";
import { NucleoRepository } from "../../infrastructure/persistence/repositories/NucleoRepository";

const nucleoRepository = new NucleoRepository();

// Handlers SEM CurrentUserService
const createNucleoHandler = new CreateNucleoHandler(nucleoRepository);
const updateNucleoHandler = new UpdateNucleoHandler(nucleoRepository);
const deleteNucleoHandler = new DeleteNucleoHandler(nucleoRepository);
const getNucleosHandler = new GetNucleosHandler(nucleoRepository);
const getNucleoByIdHandler = new GetNucleoByIdHandler(nucleoRepository);

const nucleosController = new NucleosController(
  createNucleoHandler,
  updateNucleoHandler,
  deleteNucleoHandler,
  getNucleosHandler,
  getNucleoByIdHandler,
);

export const nucleosRoutes = Router();

nucleosRoutes.use(authenticate);

nucleosRoutes.get("/", (req, res, next) => {
  nucleosController.list(req as any, res).catch(next);
});

nucleosRoutes.get("/:id", (req, res, next) => {
  nucleosController.getById(req as any, res).catch(next);
});

nucleosRoutes.post("/", (req, res, next) => {
  nucleosController.create(req as any, res).catch(next);
});

nucleosRoutes.put("/:id", (req, res, next) => {
  nucleosController.update(req as any, res).catch(next);
});

nucleosRoutes.delete("/:id", (req, res, next) => {
  nucleosController.delete(req as any, res).catch(next);
});
