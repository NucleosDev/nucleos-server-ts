import { HabitoRegistro } from "../../../domain/entities/HabitoRegistro";
import { IHabitoRepository } from "../../../domain/repositories/IHabitoRepository";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { RegistrarHabitoCommand } from "./RegistrarHabitoCommand";
import { HabitoRegistroResponseDto } from "../../dto/habito.dto";
import { NotificationsController } from "../../../api/controllers/v1/NotificationsController";
import { Habito } from "../../../domain/entities/Habito";
export class RegistrarHabitoHandler {
  constructor(private readonly habitoRepository: IHabitoRepository) {}

  async execute(
    command: RegistrarHabitoCommand,
  ): Promise<HabitoRegistroResponseDto> {
    const habitoCheck = await pool.query(
      `SELECT h.id, n.user_id
       FROM habitos h
       JOIN blocos b ON h.bloco_id = b.id
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE h.id = $1 AND h.deleted_at IS NULL`,
      [command.habitoId],
    );

    if (habitoCheck.rows.length === 0) {
      throw new Error("Hábito não encontrado");
    }

    if (habitoCheck.rows[0].user_id !== command.userId) {
      throw new Error("Acesso negado");
    }

    const dataInicio = new Date(command.data);
    dataInicio.setHours(0, 0, 0, 0);

    const registroExistente =
      await this.habitoRepository.findRegistroByHabitoAndDate(
        command.habitoId,
        dataInicio,
      );

    let registro: HabitoRegistro;

    if (registroExistente) {
      registro = registroExistente;
      registro.incrementar(command.vezesCompletadas || 1);
      await this.habitoRepository.saveRegistro(registro);
    } else {
      registro = HabitoRegistro.create({
        habitoId: command.habitoId,
        data: dataInicio,
        vezesCompletadas: command.vezesCompletadas || 1,
      });
      await this.habitoRepository.saveRegistro(registro);
    }

    await NotificationsController.createNotification(
      command.userId,
      "🔄 Hábito Registrado!",
      `Você registrou "${Habito.name}" e ganhou 30 XP!`,
    );

    return {
      id: registro.id,
      habitoId: registro.habitoId,
      data: registro.data.toISOString(),
      vezesCompletadas: registro.vezesCompletadas,
      createdAt: registro.createdAt.toISOString(),
    };
  }
}
