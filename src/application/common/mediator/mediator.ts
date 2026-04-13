import { container } from "../../../infrastructure/di/container";

export interface IRequest<TResponse = any> {
  __type?: string;
}

export interface IRequestHandler<
  TRequest extends IRequest<TResponse>,
  TResponse,
> {
  handle(request: TRequest): Promise<TResponse>;
}

export class Mediator {
  private static instance: Mediator;
  private handlers = new Map<string, IRequestHandler<any, any>>();

  static getInstance(): Mediator {
    if (!Mediator.instance) {
      Mediator.instance = new Mediator();
    }
    return Mediator.instance;
  }

  register<TRequest extends IRequest<TResponse>, TResponse>(
    requestClass: new (...args: any[]) => TRequest,
    handler: IRequestHandler<TRequest, TResponse>,
  ): void {
    this.handlers.set(requestClass.name, handler);
  }

  async send<TResponse>(request: IRequest<TResponse>): Promise<TResponse> {
    const requestName = request.constructor.name;
    const handler = this.handlers.get(requestName);

    if (!handler) {
      throw new Error(`No handler registered for ${requestName}`);
    }

    return handler.handle(request);
  }
}

export const mediator = Mediator.getInstance();
