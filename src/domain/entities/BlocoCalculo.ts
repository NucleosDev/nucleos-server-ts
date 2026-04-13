// src/domain/entities/BlocoCalculo.ts
import { v4 as uuidv4 } from 'uuid';

export type TipoOperacao = 'soma' | 'media' | 'contagem' | 'max' | 'min';

export interface BlocoCalculoProps {
  id?: string;
  blocoId: string;
  tipoOperacao: TipoOperacao;
  campo?: string;
  agruparPor?: string | null;
  config?: Record<string, any>;
  createdAt?: Date;
}

export class BlocoCalculo {
  private constructor(
    private readonly _id: string,
    private readonly _blocoId: string,
    private _tipoOperacao: TipoOperacao,
    private _campo: string,
    private _agruparPor: string | null,
    private _config: Record<string, any>,
    private readonly _createdAt: Date
  ) {}

  static create(props: BlocoCalculoProps): BlocoCalculo {
    return new BlocoCalculo(
      props.id || uuidv4(),
      props.blocoId,
      props.tipoOperacao,
      props.campo || 'valor_total',
      props.agruparPor || null,
      props.config || {},
      props.createdAt || new Date()
    );
  }

  get id(): string { return this._id; }
  get blocoId(): string { return this._blocoId; }
  get tipoOperacao(): TipoOperacao { return this._tipoOperacao; }
  get campo(): string { return this._campo; }
  get agruparPor(): string | null { return this._agruparPor; }
  get config(): Record<string, any> { return this._config; }
  get createdAt(): Date { return this._createdAt; }

  updateTipoOperacao(tipo: TipoOperacao): void {
    this._tipoOperacao = tipo;
  }

  updateCampo(campo: string): void {
    this._campo = campo;
  }

  updateConfig(config: Record<string, any>): void {
    this._config = { ...this._config, ...config };
  }

  toJSON() {
    return {
      id: this._id,
      blocoId: this._blocoId,
      tipoOperacao: this._tipoOperacao,
      campo: this._campo,
      agruparPor: this._agruparPor,
      config: this._config,
      createdAt: this._createdAt.toISOString()
    };
  }
}