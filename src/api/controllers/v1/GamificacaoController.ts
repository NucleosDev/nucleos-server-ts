// // api/controllers/v1/GamificacaoController.ts
// import { Request, Response } from 'express';
// import { mediator } from '../../../application/common/mediator/mediator';
// import { GetUserLevelQuery } from '../../../application/queries/gamificacao/get-user-level.query';
// import { GetUserConquistasQuery } from '../../../application/queries/gamificacao/get-user-conquistas.query';
// import { GetUserStreaksQuery } from '../../../application/queries/gamificacao/get-user-streaks.query';
// import { ApiResponse } from '../../../application/dto/api-response.dto';
// import { logger } from '../../../shared/utils/logger';

// export class GamificacaoController {
//   static async getLevel(req: Request, res: Response): Promise<void> {
//     try {
//       const userId = (req as any).user?.id;

//       if (!userId) {
//         res.status(401).json(ApiResponse.error('Usuário não autenticado'));
//         return;
//       }

//       const query: GetUserLevelQuery = { userId };
//       const result = await mediator.send(query);

//       res.json(ApiResponse.success(result));
//     } catch (error) {
//       logger.error('❌ Erro ao buscar level:', error);
//       res.status(500).json(ApiResponse.error('Erro interno ao buscar level'));
//     }
//   }

//   static async getConquistas(req: Request, res: Response): Promise<void> {
//     try {
//       const userId = (req as any).user?.id;

//       if (!userId) {
//         res.status(401).json(ApiResponse.error('Usuário não autenticado'));
//         return;
//       }

//       const query: GetUserConquistasQuery = { userId };
//       const result = await mediator.send(query);

//       res.json(ApiResponse.success(result));
//     } catch (error) {
//       logger.error('❌ Erro ao buscar conquistas:', error);
//       res.status(500).json(ApiResponse.error('Erro interno ao buscar conquistas'));
//     }
//   }

//   static async getStreaks(req: Request, res: Response): Promise<void> {
//     try {
//       const userId = (req as any).user?.id;

//       if (!userId) {
//         res.status(401).json(ApiResponse.error('Usuário não autenticado'));
//         return;
//       }

//       const query: GetUserStreaksQuery = { userId };
//       const result = await mediator.send(query);

//       res.json(ApiResponse.success(result));
//     } catch (error) {
//       logger.error('❌ Erro ao buscar streaks:', error);
//       res.status(500).json(ApiResponse.error('Erro interno ao buscar streaks'));
//     }
//   }
// }