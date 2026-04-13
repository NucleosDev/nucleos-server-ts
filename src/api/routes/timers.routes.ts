import { Router } from "express";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";
import { TimersController } from "../controllers/v1/TimersController";

const router = Router();

router.use(authenticate);

router.get("/timers/nucleo/:nucleoId", (req, res, next) => {
  TimersController.listByNucleo(req as AuthRequest, res).catch(next);
});

router.post("/timers/start", (req, res, next) => {
  TimersController.start(req as AuthRequest, res).catch(next);
});

router.post("/timers/:id/stop", (req, res, next) => {
  TimersController.stop(req as AuthRequest, res).catch(next);
});

export { router };
