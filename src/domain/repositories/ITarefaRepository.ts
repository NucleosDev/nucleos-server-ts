import { Tarefa } from '../entities/Tarefa';

export interface ITarefaRepository {
  save(tarefa: Tarefa): Promise<void>;
  findById(id: string): Promise<Tarefa | null>;
  findAllByBlocoId(blocoId: string): Promise<Tarefa[]>;
  findAllVencendo(userId: string): Promise<any[]>;
  update(tarefa: Tarefa): Promise<void>;
  delete(id: string): Promise<void>;
  getNextPosition(blocoId: string): Promise<number>;
}