
import { HabitoRegistro } from "../../../domain/entities/HabitoRegistro";
import { IHabitoRepository } from "../../../domain/repositories/IHabitoRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { RegistrarHabitoCommand } from "./RegistrarHabitoCommand";
import { HabitoRegistroResponseDto } from "../../dto/habito.dto";

export class RegistrarHabitoHandler {
  constructor(
    private readonly habitoRepository: IHabitoRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(
    command: RegistrarHabitoCommand,
  ): Promise<HabitoRegistroResponseDto> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar se o hábito pertence ao usuário
    const habitoCheck = await pool.query(
      `SELECT h.id, b.nucleo_id, n.user_id
       FROM habitos h
       JOIN blocos b ON h.bloco_id = b.id
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE h.id = $1 AND h.deleted_at IS NULL`,
      [command.habitoId],
    );

    if (habitoCheck.rows.length === 0) {
      throw new Error("Hábito não encontrado");
    }

    if (habitoCheck.rows[0].user_id !== userId) {
      throw new Error("Acesso negado");
    }

    // Verificar se já existe registro para hoje
    const dataInicio = new Date(command.data);
    dataInicio.setHours(0, 0, 0, 0);

    const registroExistente =
      await this.habitoRepository.findRegistroByHabitoAndDate(
        command.habitoId,
        dataInicio,
      );

    let registro: HabitoRegistro;

    if (registroExistente) {
      // Atualizar registro existente
      registro = registroExistente;
      registro.incrementar(command.vezesCompletadas || 1);
      await this.habitoRepository.saveRegistro(registro);
    } else {
      // Criar novo registro
      registro = HabitoRegistro.create({
        habitoId: command.habitoId,
        data: dataInicio,
        vezesCompletadas: command.vezesCompletadas || 1,
      });
      await this.habitoRepository.saveRegistro(registro);
    }

    return {
      id: registro.id,
      habitoId: registro.habitoId,
      data: registro.data.toISOString(),
      vezesCompletadas: registro.vezesCompletadas,
      createdAt: registro.createdAt.toISOString(),
    };
  }
}
