import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { CreateEventoHandler } from "../../../application/commands/calendario/CreateEventoHandler";
import { CreateEventoCommand } from "../../../application/commands/calendario/CreateEventoCommand";
import { UpdateEventoHandler } from "../../../application/commands/calendario/UpdateEventoHandler";
import { UpdateEventoCommand } from "../../../application/commands/calendario/UpdateEventoCommand";
import { DeleteEventoHandler } from "../../../application/commands/calendario/DeleteEventoHandler";
import { DeleteEventoCommand } from "../../../application/commands/calendario/DeleteEventoCommand";
import { GetEventosByNucleoHandler } from "../../../application/queries/calendario/GetEventosByNucleoHandler";
import { GetEventosByNucleoQuery } from "../../../application/queries/calendario/GetEventosByNucleoQuery";
import { GetEventoByIdHandler } from "../../../application/queries/calendario/GetEventoByIdHandler";
import { GetEventoByIdQuery } from "../../../application/queries/calendario/GetEventoByIdQuery";

export class CalendarioController {
  constructor(
    private readonly createHandler: CreateEventoHandler,
    private readonly updateHandler: UpdateEventoHandler,
    private readonly deleteHandler: DeleteEventoHandler,
    private readonly listByNucleoHandler: GetEventosByNucleoHandler,
    private readonly getByIdHandler: GetEventoByIdHandler,
  ) {}

  async getByNucleo(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const nucleoIdParam = req.params.nucleoId;
      const nucleoId =
        typeof nucleoIdParam === "string" ? nucleoIdParam : undefined;
      if (!nucleoId) {
        return res
          .status(400)
          .json({ success: false, message: "nucleoId é obrigatório" });
      }

      const { start, end } = req.query;
      const startStr = typeof start === "string" ? start : undefined;
      const endStr = typeof end === "string" ? end : undefined;
      const startDate = startStr ? new Date(startStr) : undefined;
      const endDate = endStr ? new Date(endStr) : undefined;

      const query = new GetEventosByNucleoQuery(
        userId,
        nucleoId,
        startDate,
        endDate,
      );
      const result = await this.listByNucleoHandler.execute(query);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const idParam = req.params.id;
      const nucleoIdQuery = req.query.nucleoId;

      const eventoId = typeof idParam === "string" ? idParam : undefined;
      const nucleoId =
        typeof nucleoIdQuery === "string" ? nucleoIdQuery : undefined;

      if (!eventoId || !nucleoId) {
        return res
          .status(400)
          .json({
            success: false,
            message: "ID do evento e nucleoId são obrigatórios",
          });
      }

      const query = new GetEventoByIdQuery(userId, eventoId, nucleoId);
      const result = await this.getByIdHandler.execute(query);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const { nucleoId, titulo, descricao, dataEvento, duracaoMinutos } =
        req.body;

      if (!nucleoId || !titulo || !dataEvento) {
        return res
          .status(400)
          .json({
            success: false,
            message: "nucleoId, titulo e dataEvento são obrigatórios",
          });
      }

      const command = new CreateEventoCommand(
        userId,
        nucleoId,
        titulo,
        new Date(dataEvento),
        descricao,
        duracaoMinutos,
      );
      const result = await this.createHandler.execute(command);
      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const idParam = req.params.id;
      const { nucleoId, titulo, descricao, dataEvento, duracaoMinutos } =
        req.body;

      const eventoId = typeof idParam === "string" ? idParam : undefined;
      if (!eventoId || !nucleoId) {
        return res
          .status(400)
          .json({
            success: false,
            message: "ID do evento e nucleoId são obrigatórios",
          });
      }

      const command = new UpdateEventoCommand(
        userId,
        eventoId,
        nucleoId,
        titulo,
        descricao,
        dataEvento ? new Date(dataEvento) : undefined,
        duracaoMinutos,
      );
      const result = await this.updateHandler.execute(command);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const idParam = req.params.id;
      const { nucleoId } = req.body;

      const eventoId = typeof idParam === "string" ? idParam : undefined;
      if (!eventoId || !nucleoId) {
        return res
          .status(400)
          .json({
            success: false,
            message: "ID do evento e nucleoId são obrigatórios",
          });
      }

      const command = new DeleteEventoCommand(userId, eventoId, nucleoId);
      await this.deleteHandler.execute(command);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
