import { ITarefaRepository } from "../../../domain/repositories/ITarefaRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { TarefaVencendoResponseDto } from "../../dto/tarefa.dto";
import { GetTarefasVencendoQuery } from "./GetTarefasVencendoQuery";

export class GetTarefasVencendoHandler {
  constructor(
    private readonly tarefaRepository: ITarefaRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(
    query: GetTarefasVencendoQuery,
  ): Promise<TarefaVencendoResponseDto[]> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    return await this.tarefaRepository.findAllVencendo(userId);
  }
}
    