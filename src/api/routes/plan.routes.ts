import { Router } from "express";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";
import { PlansController } from "../controllers/v1/PlansController";

const router = Router();

router.use(authenticate);

router.get("/plans", (req, res, next) => {
  PlansController.list(req as AuthRequest, res).catch(next);
});

router.get("/plans/subscription", (req, res, next) => {
  PlansController.getCurrentSubscription(req as AuthRequest, res).catch(next);
});

export { router };
