import { Router } from "express";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";
import { ProgressController } from "../controllers/v1/ProgressController";

const router = Router();

router.use(authenticate);

router.get("/progress/xp", (req, res, next) => {
  ProgressController.getXp(req as AuthRequest, res).catch(next);
});

router.get("/progress/energy", (req, res, next) => {
  ProgressController.getEnergy(req as AuthRequest, res).catch(next);
});

export { router };
