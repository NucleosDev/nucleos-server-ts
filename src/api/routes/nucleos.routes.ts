import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { NucleosController } from "../../api/controllers/v1/NucleosController";
import { CreateNucleoHandler } from "../../application/commands/nucleos/CreateNucleoHandler";
import { UpdateNucleoHandler } from "../../application/commands/nucleos/UpdateNucleoHandler";
import { DeleteNucleoHandler } from "../../application/commands/nucleos/DeleteNucleoHandler";
import { GetNucleosHandler } from "../../application/queries/nucleos/GetNucleosHandler";
import { GetNucleoByIdHandler } from "../../application/queries/nucleos/GetNucleoByIdHandler";
import { NucleoRepository } from "../../infrastructure/persistence/repositories/NucleoRepository";
import { NucleoIconRepository } from "../../infrastructure/persistence/repositories/NucleoIconRepository";

// Instâncias manuais (SEM TypeDI)
const nucleoRepository = new NucleoRepository();
const nucleoIconRepository = new NucleoIconRepository();

// Handlers com as dependências corretas
const createNucleoHandler = new CreateNucleoHandler(
  nucleoRepository,
  nucleoIconRepository,
);
const updateNucleoHandler = new UpdateNucleoHandler(
  nucleoRepository,
  nucleoIconRepository,
);
const deleteNucleoHandler = new DeleteNucleoHandler(nucleoRepository);
const getNucleosHandler = new GetNucleosHandler(
  nucleoRepository,
  nucleoIconRepository,
);
const getNucleoByIdHandler = new GetNucleoByIdHandler(
  nucleoRepository,
  nucleoIconRepository,
);

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
