import { Habito, FrequenciaHabito } from "../../../domain/entities/Habito";
import { IHabitoRepository } from "../../../domain/repositories/IHabitoRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { CreateHabitoCommand } from "./CreateHabitoCommand";
import { HabitoResponseDto } from "../../dto/habito.dto";

export class CreateHabitoHandler {
  constructor(
    private readonly habitoRepository: IHabitoRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(command: CreateHabitoCommand): Promise<HabitoResponseDto> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar se o bloco pertence ao usuário
    const blocoCheck = await pool.query(
      `SELECT b.id, n.user_id 
       FROM blocos b
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE b.id = $1 AND b.deleted_at IS NULL`,
      [command.blocoId],
    );

    if (blocoCheck.rows.length === 0) {
      throw new Error("Bloco não encontrado");
    }

    if (blocoCheck.rows[0].user_id !== userId) {
      throw new Error("Acesso negado");
    }

    // Garantir que frequencia tenha um valor padrão
    const frequencia: FrequenciaHabito = command.frequencia || "diaria";

    const habito = Habito.create({
      blocoId: command.blocoId,
      nome: command.nome,
      frequencia: frequencia,
      diasSemana: command.diasSemana,
      metaVezes: command.metaVezes,
    });

    await this.habitoRepository.save(habito);

    return {
      id: habito.id,
      blocoId: habito.blocoId,
      nome: habito.nome,
      frequencia: habito.frequencia,
      diasSemana: habito.diasSemana,
      metaVezes: habito.metaVezes,
      streakAtual: 0,
      streakMaximo: 0,
      completoHoje: false,
      createdAt: habito.createdAt.toISOString(),
      updatedAt: habito.updatedAt.toISOString(),
    };
  }
}
