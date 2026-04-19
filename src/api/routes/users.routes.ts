// src/api/routes/users.routes.ts
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { UsersController } from "../controllers/v1/UsersController";
import { AuthRequest } from "../middlewares/auth.middleware";

const router = Router();

// Todas as rotas exigem autenticação
router.use(authenticate);

//  CORRIGIDO: Remover o "/users" duplicado
// Perfil
router.get("/me", (req, res, next) => {
  UsersController.getCurrentUser(req as AuthRequest, res).catch(next);
});

router.patch("/profile", (req, res, next) => {
  UsersController.updateProfile(req as AuthRequest, res).catch(next);
});

// Preferências
router.patch("/preferences", (req, res, next) => {
  UsersController.updatePreferences(req as AuthRequest, res).catch(next);
});

// Estatísticas
router.get("/stats", (req, res, next) => {
  UsersController.getUserStats(req as AuthRequest, res).catch(next);
});

// Conquistas
router.get("/achievements", (req, res, next) => {
  UsersController.getUserAchievements(req as AuthRequest, res).catch(next);
});

// Logs
router.get("/xp-logs", (req, res, next) => {
  UsersController.getXpLogs(req as AuthRequest, res).catch(next);
});

router.get("/energy-logs", (req, res, next) => {
  UsersController.getEnergyLogs(req as AuthRequest, res).catch(next);
});

router.get("/activity-logs", (req, res, next) => {
  UsersController.getActivityLogs(req as AuthRequest, res).catch(next);
});

// Plano
router.get("/plan", (req, res, next) => {
  UsersController.getCurrentPlan(req as AuthRequest, res).catch(next);
});

// Gerenciamento de conta
router.delete("/account", (req, res, next) => {
  UsersController.deleteAccount(req as AuthRequest, res).catch(next);
});

router.post("/reactivate", (req, res, next) => {
  UsersController.reactivateAccount(req as AuthRequest, res).catch(next);
});

export { router };
