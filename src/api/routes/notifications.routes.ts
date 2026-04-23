// src/api/routes/notifications.routes.ts
import { Router } from "express";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";
import { NotificationsController } from "../controllers/v1/NotificationsController";

const router = Router();

router.use(authenticate);

// IMPORTANTE: NÃO colocar "/notifications" aqui porque já tem no index.ts
router.get("/", (req, res, next) => {
  NotificationsController.list(req as AuthRequest, res).catch(next);
});

router.get("/unread-count", (req, res, next) => {
  NotificationsController.getUnreadCount(req as AuthRequest, res).catch(next);
});

router.patch("/:id/read", (req, res, next) => {
  NotificationsController.markAsRead(req as AuthRequest, res).catch(next);
});

router.patch("/read-all", (req, res, next) => {
  NotificationsController.markAllAsRead(req as AuthRequest, res).catch(next);
});

router.delete("/:id", (req, res, next) => {
  NotificationsController.delete(req as AuthRequest, res).catch(next);
});

export const notificationsRoutes = router;
