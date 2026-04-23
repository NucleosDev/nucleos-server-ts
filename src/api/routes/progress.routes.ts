import { Router } from "express";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";
import { ProgressController } from "../controllers/v1/ProgressController";

const router = Router();

router.use(authenticate);

router.get("/xp", (req, res, next) => {
  ProgressController.getXp(req as AuthRequest, res).catch(next);
});

// GET /progress/energy - Buscar energia do usuário
router.get("/energy", (req, res, next) => {
  ProgressController.getEnergy(req as AuthRequest, res).catch(next);
});

// POST /progress/energy/consume - Consumir energia (opcional)
router.post("/energy/consume", (req, res, next) => {
  ProgressController.consumeEnergy(req as AuthRequest, res).catch(next);
});

export { router as progressRoutes };
