import { IListaRepository } from '../../../domain/repositories/IListaRepository';
import { ICurrentUserService } from '../../interfaces/ICurrentUserService';
import { UpdateListaCommand } from './UpdateListaCommand';
import { ListaResponseDto } from '../../dto/lista.dto';
import { pool } from '../../../infrastructure/persistence/db/connection';

export class UpdateListaHandler {
  constructor(
    private readonly listaRepository: IListaRepository,
    private readonly currentUserService: ICurrentUserService
  ) {}

  async execute(command: UpdateListaCommand): Promise<ListaResponseDto> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    const lista = await this.listaRepository.findListaById(command.id);
    if (!lista) {
      throw new Error('Lista não encontrada');
    }

    // Verificar permissão
    const blocoCheck = await pool.query(
      `SELECT n.user_id 
       FROM listas l
       JOIN blocos b ON l.bloco_id = b.id
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE l.id = $1`,
      [command.id]
    );

    if (blocoCheck.rows[0]?.user_id !== userId) {
      throw new Error('Acesso negado');
    }

    if (command.nome !== undefined) {
      lista.updateNome(command.nome);
    }
    if (command.tipoLista !== undefined) {
      lista.updateTipoLista(command.tipoLista);
    }

    await this.listaRepository.updateLista(lista);

    return {
      id: lista.id,
      blocoId: lista.blocoId,
      nome: lista.nome,
      tipoLista: lista.tipoLista,
      createdAt: lista.createdAt.toISOString(),
      updatedAt: lista.updatedAt.toISOString()
    };
  }
}