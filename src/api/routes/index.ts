import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { router as usersRoutes } from "./users.routes";  

import "express";

declare module "express-serve-static-core" {
  interface Request {
    requestId?: string;
    timedout?: boolean;
  }
}

// Importações futuras (comentadas até implementar)
import { nucleosRoutes } from "./nucleos.routes";
import { blocosRoutes } from "./blocos.routes";
import { colecoesRoutes } from "./colecoes.routes";
// import { camposRoutes } from './campos.routes';
// import { itensRoutes } from './itens.routes';
// import { itemValoresRoutes } from './item-valores.routes';
import { tarefasRoutes } from "./tarefas.routes";
import { listasRoutes } from "./listas.routes";
import { habitosRoutes } from "./habitos.routes";
// import { gamificacaoRoutes } from './gamificacao.routes';
// import { progressRoutes } from './progress.routes';
// import { notificationsRoutes } from './notifications.routes';
// import { plansRoutes } from './plans.routes';
// import { timersRoutes } from './timers.routes';
import { calendarioRoutes } from "./calendario.routes";
// import { insightsRoutes } from './insights.routes';
// import { adminRoutes } from './admin.routes';

const router = Router();

// Rotas ativas
router.use("/Auth", authRoutes);

// Rotas futuras (descomentar quando implementar os controllers)
router.use("/nucleos", nucleosRoutes);
router.use("/blocos", blocosRoutes);
router.use("/colecoes", colecoesRoutes);
// router.use('/campos', camposRoutes);
// router.use('/itens', itensRoutes);
// router.use('/item-valores', itemValoresRoutes);
router.use("/tarefas", tarefasRoutes);
router.use("/listas", listasRoutes);
router.use("/habitos", habitosRoutes);
// router.use('/gamificacao', gamificacaoRoutes);
// router.use('/progress', progressRoutes);
router.use('/users', usersRoutes);
// router.use('/notifications', notificationsRoutes);
// router.use('/plans', plansRoutes);
// router.use('/timers', timersRoutes);
router.use("/calendario", calendarioRoutes);
// router.use('/insights', insightsRoutes);
// router.use('/admin', adminRoutes);

export { router };
