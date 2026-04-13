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
    private readonly createEventoHandler: CreateEventoHandler,
    private readonly updateEventoHandler: UpdateEventoHandler,
    private readonly deleteEventoHandler: DeleteEventoHandler,
    private readonly getEventosByNucleoHandler: GetEventosByNucleoHandler,
    private readonly getEventoByIdHandler: GetEventoByIdHandler,
  ) {}

  async listByNucleo(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { nucleoId } = req.params;
      const { start, end } = req.query;

      if (!nucleoId || typeof nucleoId !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "ID do núcleo inválido" });
      }

      const startDate = start ? new Date(start as string) : undefined;
      const endDate = end ? new Date(end as string) : undefined;

      const query = new GetEventosByNucleoQuery(nucleoId, startDate, endDate);
      const result = await this.getEventosByNucleoHandler.execute(query);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }

      const query = new GetEventoByIdQuery(id);
      const result = await this.getEventoByIdHandler.execute(query);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { nucleoId, titulo, descricao, dataEvento, duracaoMinutos } =
        req.body;

      if (!nucleoId || typeof nucleoId !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "NucleoId inválido" });
      }
      if (!titulo || typeof titulo !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "Título é obrigatório" });
      }
      if (!dataEvento) {
        return res
          .status(400)
          .json({ success: false, message: "Data do evento é obrigatória" });
      }

      const command = new CreateEventoCommand(
        nucleoId,
        titulo,
        new Date(dataEvento),
        descricao,
        duracaoMinutos,
      );
      const result = await this.createEventoHandler.execute(command);
      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { titulo, descricao, dataEvento, duracaoMinutos } = req.body;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }

      const command = new UpdateEventoCommand(
        id,
        titulo,
        descricao,
        dataEvento ? new Date(dataEvento) : undefined,
        duracaoMinutos,
      );
      const result = await this.updateEventoHandler.execute(command);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }

      const command = new DeleteEventoCommand(id);
      await this.deleteEventoHandler.execute(command);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
