// src/api/routes/index.ts
import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { router as usersRoutes } from "./users.routes";

import { nucleosRoutes } from "./nucleos.routes";
import { router as blocosRoutes } from "./blocos.routes";
import { colecoesRoutes } from "./colecoes.routes";
import { tarefasRoutes } from "./tarefas.routes";
import { listasRoutes } from "./listas.routes";
import { habitosRoutes } from "./habitos.routes";
import { gamificacaoRoutes } from "./gamificacao.routes";
import { progressRoutes } from "./progress.routes";
import { notificationsRoutes } from "./notifications.routes";
import { router as timersRoutes } from "./timers.routes";
import { calendarioRoutes } from "./calendario.routes";
import { exerciciosRoutes } from "./exercicios.routes";

const router = Router();

router.use("/Auth", authRoutes);
router.use("/nucleos", nucleosRoutes);
router.use("/", blocosRoutes);
router.use("/colecoes", colecoesRoutes);
router.use("/tarefas", tarefasRoutes);
router.use("/listas", listasRoutes);
router.use("/habitos", habitosRoutes);
router.use("/gamificacao", gamificacaoRoutes);
router.use("/progress", progressRoutes);
router.use("/users", usersRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/timers", timersRoutes);
router.use("/calendario", calendarioRoutes);
router.use("/exercicios", exerciciosRoutes);

export { router };
