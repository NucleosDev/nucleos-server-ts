import { IColecaoRepository } from "../../../domain/repositories/IColecaoRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { UpdateColecaoCommand } from "./UpdateColecaoCommand";
import { ColecaoResponseDto } from "../../dto/colecao.dto";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class UpdateColecaoHandler {
  constructor(
    private readonly colecaoRepository: IColecaoRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(command: UpdateColecaoCommand): Promise<ColecaoResponseDto> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const colecao = await this.colecaoRepository.findColecaoById(command.id);
    if (!colecao) {
      throw new Error("Coleção não encontrada");
    }

    // Verificar permissão via bloco
    const blocoCheck = await pool.query(
      `SELECT n.user_id 
       FROM colecoes c
       JOIN blocos b ON c.bloco_id = b.id
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE c.id = $1`,
      [command.id],
    );

    if (blocoCheck.rows[0]?.user_id !== userId) {
      throw new Error("Acesso negado");
    }

    if (command.nome !== undefined) {
      colecao.updateNome(command.nome);
    }

    await this.colecaoRepository.updateColecao(colecao);

    return {
      id: colecao.id,
      blocoId: colecao.blocoId,
      nome: colecao.nome,
      createdAt: colecao.createdAt.toISOString(),
      updatedAt: colecao.updatedAt.toISOString(),
    };
  }
}
