import { Router } from "express";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";
import { AdminController } from "../controllers/v1/AdminController";
import { requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);
router.use(requireRole("admin"));

router.get("/admin/stats", (req, res, next) => {
  AdminController.getStats(req as AuthRequest, res).catch(next);
});

router.get("/admin/users", (req, res, next) => {
  AdminController.getUsers(req as AuthRequest, res).catch(next);
});

export { router };
