// src/api/routes/timers.routes.ts
import { Router } from "express";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";
import { TimersController } from "../controllers/v1/TimersController";

const router = Router();

router.use(authenticate);

router.get("/nucleo/:nucleoId", (req, res, next) => {
  TimersController.listByNucleo(req as AuthRequest, res).catch(next);
});

router.post("/start", (req, res, next) => {
  TimersController.start(req as AuthRequest, res).catch(next);
});

router.post("/:id/stop", (req, res, next) => {
  TimersController.stop(req as AuthRequest, res).catch(next);
});

router.delete("/:id", (req, res, next) => {
  TimersController.delete(req as AuthRequest, res).catch(next);
});

router.put("/:id", authenticate, (req, res, next) => {
  TimersController.update(req as AuthRequest, res).catch(next);
});

export { router };
