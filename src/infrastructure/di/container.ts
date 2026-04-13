import 'reflect-metadata';
import { Container } from 'typedi';
import { NucleoRepository } from '../persistence/repositories/NucleoRepository';
import { mediator } from '../../application/common/mediator/mediator';
import { BlocoRepository } from '../persistence/repositories/BlocoRepository';
// import { TarefaRepository } from '../persistence/repositories/TarefaRepository';

// Exportar container para uso global
export const container = Container;

// Registrar serviços manualmente
export function registerServices(): void {
  // Repositories
 container.set('NucleoRepository', () => new NucleoRepository());
  container.set('BlocoRepository', () => new BlocoRepository()); 
//   container.set('TarefaRepository', () => new TarefaRepository());
  
  // Services
//   container.set('GamificacaoService', () => new GamificacaoService());
//   container.set('AIService', () => new AIService());
  
  // Mediator
  container.set('Mediator', () => mediator);
}