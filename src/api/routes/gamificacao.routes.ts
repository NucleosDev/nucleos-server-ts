// src/api/routes/gamificacao.routes.ts
import { Router } from "express";
import { GamificacaoController } from "../controllers/v1/GamificacaoController";
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware";

export const gamificacaoRoutes = Router();
const controller = new GamificacaoController();

// aplica auth em tudo
gamificacaoRoutes.use(authMiddleware);

// Rotas principais
gamificacaoRoutes.get("/stats", (req, res, next) => {
  controller.getUserStats(req as AuthRequest, res).catch(next);
});

gamificacaoRoutes.get("/leaderboard", (req, res, next) => {
  controller.getLeaderboard(req as AuthRequest, res).catch(next);
});

gamificacaoRoutes.get("/achievements", (req, res, next) => {
  controller.getAchievements(req as AuthRequest, res).catch(next);
});

gamificacaoRoutes.get("/history", (req, res, next) => {
  controller.getXpHistory(req as AuthRequest, res).catch(next);
});

gamificacaoRoutes.get("/streak", (req, res, next) => {
  controller.getStreak(req as AuthRequest, res).catch(next);
});

// opcional
gamificacaoRoutes.post("/process-action", (req, res, next) => {
  controller.processAction(req as AuthRequest, res).catch(next);
});
