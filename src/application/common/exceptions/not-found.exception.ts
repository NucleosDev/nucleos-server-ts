export class NotFoundException extends Error {
  public readonly entityName: string;
  public readonly entityId?: string;
  public readonly statusCode: number = 404;

  constructor(entityName: string, entityId?: string) {
    const message = entityId 
      ? `${entityName} with id "${entityId}" not found`
      : `${entityName} not found`;
    
    super(message);
    this.name = 'NotFoundException';
    this.entityName = entityName;
    this.entityId = entityId;
    
    // Manter stack trace adequado
    Object.setPrototypeOf(this, NotFoundException.prototype);
  }

  static forEntity(entityName: string, entityId?: string): NotFoundException {
    return new NotFoundException(entityName, entityId);
  }

  static forUser(id?: string): NotFoundException {
    return new NotFoundException('User', id);
  }

  static forNucleo(id?: string): NotFoundException {
    return new NotFoundException('Nucleo', id);
  }

  static forBloco(id?: string): NotFoundException {
    return new NotFoundException('Bloco', id);
  }

  static forTarefa(id?: string): NotFoundException {
    return new NotFoundException('Tarefa', id);
  }

  static forHabito(id?: string): NotFoundException {
    return new NotFoundException('Habito', id);
  }

  static forLista(id?: string): NotFoundException {
    return new NotFoundException('Lista', id);
  }

  static forItemLista(id?: string): NotFoundException {
    return new NotFoundException('ItemLista', id);
  }

  static forColecao(id?: string): NotFoundException {
    return new NotFoundException('Colecao', id);
  }

  static forCampo(id?: string): NotFoundException {
    return new NotFoundException('Campo', id);
  }

  toResponse(): object {
    return {
      success: false,
      message: this.message,
      statusCode: this.statusCode,
      entity: this.entityName,
      entityId: this.entityId,
    };
  }
}