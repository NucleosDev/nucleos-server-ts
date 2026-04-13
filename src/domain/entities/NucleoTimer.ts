// src/domain/entities/NucleoTimer.ts
import { v4 as uuidv4 } from "uuid";

export interface NucleoTimerProps {
  id?: string;
  nucleoId: string;
  titulo?: string | null;
  inicio?: Date | null;
  fim?: Date | null;
  duracaoSegundos?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class NucleoTimer {
  private constructor(
    private readonly _id: string,
    private readonly _nucleoId: string,
    private _titulo: string | null,
    private _inicio: Date | null,
    private _fim: Date | null,
    private _duracaoSegundos: number | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(props: NucleoTimerProps): NucleoTimer {
    return new NucleoTimer(
      props.id || uuidv4(),
      props.nucleoId,
      props.titulo || null,
      props.inicio || null,
      props.fim || null,
      props.duracaoSegundos || null,
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }

  static reconstitute(props: Required<NucleoTimerProps>): NucleoTimer {
    return new NucleoTimer(
      props.id!,
      props.nucleoId,
      props.titulo || null,
      props.inicio || null,
      props.fim || null,
      props.duracaoSegundos || null,
      props.createdAt!,
      props.updatedAt!,
    );
  }

  get id(): string {
    return this._id;
  }
  get nucleoId(): string {
    return this._nucleoId;
  }
  get titulo(): string | null {
    return this._titulo;
  }
  get inicio(): Date | null {
    return this._inicio;
  }
  get fim(): Date | null {
    return this._fim;
  }
  get duracaoSegundos(): number | null {
    return this._duracaoSegundos;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get isAtivo(): boolean {
    return this._inicio !== null && this._fim === null;
  }
  get isConcluido(): boolean {
    return this._fim !== null;
  }
  get duracaoFormatada(): string | null {
    if (!this._duracaoSegundos) return null;
    const horas = Math.floor(this._duracaoSegundos / 3600);
    const minutos = Math.floor((this._duracaoSegundos % 3600) / 60);
    const segundos = this._duracaoSegundos % 60;
    return `${horas.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`;
  }

  iniciar(titulo?: string): void {
    if (this._inicio && !this._fim) {
      throw new Error("Timer já está em andamento");
    }
    if (this._fim) {
      throw new Error("Timer já foi concluído. Crie um novo timer.");
    }
    this._inicio = new Date();
    if (titulo) {
      this._titulo = titulo;
    }
    this.touch();
  }

  pausar(): void {
    if (!this._inicio) {
      throw new Error("Timer não foi iniciado");
    }
    if (this._fim) {
      throw new Error("Timer já foi concluído");
    }
    if (this._duracaoSegundos === null) {
      this._duracaoSegundos = 0;
    }
    this._duracaoSegundos += Math.floor(
      (Date.now() - this._inicio.getTime()) / 1000,
    );
    this._inicio = null;
    this.touch();
  }

  retomar(): void {
    if (this._inicio) {
      throw new Error("Timer já está em andamento");
    }
    if (this._fim) {
      throw new Error("Timer já foi concluído");
    }
    this._inicio = new Date();
    this.touch();
  }

  parar(): void {
    if (!this._inicio && this._duracaoSegundos === null) {
      throw new Error("Timer não foi iniciado");
    }
    if (this._fim) {
      throw new Error("Timer já foi concluído");
    }
    if (this._inicio) {
      const segundosAdicionais = Math.floor(
        (Date.now() - this._inicio.getTime()) / 1000,
      );
      this._duracaoSegundos = (this._duracaoSegundos || 0) + segundosAdicionais;
      this._inicio = null;
    }
    this._fim = new Date();
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this._id,
      nucleoId: this._nucleoId,
      titulo: this._titulo,
      inicio: this._inicio?.toISOString() || null,
      fim: this._fim?.toISOString() || null,
      duracaoSegundos: this._duracaoSegundos,
      duracaoFormatada: this.duracaoFormatada,
      isAtivo: this.isAtivo,
      isConcluido: this.isConcluido,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
