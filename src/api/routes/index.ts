// src/api/routes/index.ts
import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { router as usersRoutes } from "./users.routes";
console.log("rotas carregadas");

import "express";

declare module "express-serve-static-core" {
  interface Request {
    requestId?: string;
    timedout?: boolean;
  }
}

// Importações
import { nucleosRoutes } from "./nucleos.routes";
import { router as blocosRoutes } from "./blocos.routes";
import { colecoesRoutes } from "./colecoes.routes";
import { tarefasRoutes } from "./tarefas.routes";
import { listasRoutes } from "./listas.routes";
import { habitosRoutes } from "./habitos.routes";
import { gamificacaoRoutes } from "./gamificacao.routes"; // ← DESCOMENTAR
import { progressRoutes } from "./progress.routes";
import { notificationsRoutes } from "./notifications.routes"; // ← DESCOMENTAR
// import { planRoutes } from './plan.routes';
import { router as timersRoutes } from "./timers.routes";
import { calendarioRoutes } from "./calendario.routes";
// import { insightsRoutes } from './insights.routes';
// import { adminRoutes } from './admin.routes';

const router = Router();

// Rotas ativas
router.use("/Auth", authRoutes);

// Rotas
router.use("/nucleos", nucleosRoutes);
router.use("/", blocosRoutes);
router.use("/colecoes", colecoesRoutes);
router.use("/tarefas", tarefasRoutes);
router.use("/listas", listasRoutes);
router.use("/habitos", habitosRoutes);
router.use("/gamificacao", gamificacaoRoutes); // ← DESCOMENTAR
router.use("/progress", progressRoutes);
router.use("/users", usersRoutes);
router.use("/notifications", notificationsRoutes); // ← DESCOMENTAR
// router.use('/plans', plansRoutes);
router.use("/timers", timersRoutes);
router.use("/calendario", calendarioRoutes);
// router.use('/insights', insightsRoutes);
// router.use('/admin', adminRoutes);

export { router };
