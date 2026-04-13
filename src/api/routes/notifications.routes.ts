// src/api/routes/notifications.routes.ts
import { Router } from "express";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";
import { NotificationsController } from "../controllers/v1/NotificationsController";

const router = Router();

router.use(authenticate);

router.get("/notifications", (req, res, next) => {
  NotificationsController.list(req as AuthRequest, res).catch(next);
});

router.patch("/notifications/:id/read", (req, res, next) => {
  NotificationsController.markAsRead(req as AuthRequest, res).catch(next);
});

router.patch("/notifications/read-all", (req, res, next) => {
  NotificationsController.markAllAsRead(req as AuthRequest, res).catch(next);
});

router.delete("/notifications/:id", (req, res, next) => {
  NotificationsController.delete(req as AuthRequest, res).catch(next);
});

export { router };
