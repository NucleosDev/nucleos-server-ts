import { Router } from "express";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";
import { GamificacaoController } from "../controllers/v1/GamificacaoController";

const router = Router();

router.use(authenticate);

router.get("/gamificacao/level", (req, res, next) => {
  GamificacaoController.getLevel(req as AuthRequest, res).catch(next);
});

router.get("/gamificacao/conquistas", (req, res, next) => {
  GamificacaoController.getConquistas(req as AuthRequest, res).catch(next);
});

router.get("/gamificacao/streaks", (req, res, next) => {
  GamificacaoController.getStreaks(req as AuthRequest, res).catch(next);
});

// router.post("/gamificacao/add-xp", (req, res, next) => {
//   GamificacaoController.addXp(req as AuthRequest, res).catch(next);
// });

export { router };
