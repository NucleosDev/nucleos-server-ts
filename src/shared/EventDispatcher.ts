// src/shared/EventDispatcher.ts
type EventHandler = (event: any) => Promise<void> | void;

class EventDispatcher {
  private handlers: Map<string, EventHandler[]> = new Map();

  register(eventName: string, handler: EventHandler): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
    console.log(`📡 Evento registrado: ${eventName}`);
  }

  async dispatch(event: any): Promise<void> {
    const eventName = event.constructor.name;
    const handlers = this.handlers.get(eventName) || [];

    if (handlers.length === 0) {
      console.log(`⚠️ Nenhum handler para o evento: ${eventName}`);
      return;
    }

    console.log(
      `🚀 Disparando evento: ${eventName} para ${handlers.length} handler(s)`,
    );

    await Promise.all(
      handlers.map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          console.error(`❌ Erro no handler de ${eventName}:`, error);
        }
      }),
    );
  }
}

export const eventDispatcher = new EventDispatcher();
