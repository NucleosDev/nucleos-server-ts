type EventHandler<T = any> = (payload: T) => void | Promise<void>;

class EventBus {
  private listeners: Map<string, EventHandler[]> = new Map();

  on<T>(event: string, handler: EventHandler<T>): void {
    const existing = this.listeners.get(event) ?? [];
    this.listeners.set(event, [...existing, handler as EventHandler]);
  }

  async emit<T>(event: string, payload: T): Promise<void> {
    const handlers = this.listeners.get(event) ?? [];
    await Promise.all(handlers.map(h => h(payload)));
  }

  off(event: string): void {
    this.listeners.delete(event);
  }
}

export const eventBus = new EventBus();

export const SYSTEM_EVENTS = {
  TAREFA_CONCLUIDA:   'tarefa.concluida',
  HABITO_REGISTRADO:  'habito.registrado',
  NUCLEO_CRIADO:      'nucleo.criado',
  XP_GANHO:           'xp.ganho',
  NIVEL_ALCANCADO:    'nivel.alcancado',
  USER_REGISTERED:    'user.registered',
} as const;
