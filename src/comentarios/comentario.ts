export class Comentario {
  constructor(
    public readonly id: number | null,
    public readonly uuid: string | null,
    public readonly postUuid: string,
    public readonly autorUuid: string,
    public readonly autorNome: string,
    public conteudo: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public apagado: boolean = false,
    public apagadoEm: Date | null = null,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.postUuid || this.postUuid.trim() === '') {
      throw new Error('Post uuid is required');
    }
    if (!this.autorUuid || this.autorUuid.trim() === '') {
      throw new Error('Author uuid is required');
    }
    if (!this.autorNome || this.autorNome.trim() === '') {
      throw new Error('Author name is required');
    }
    if (!this.apagado && (!this.conteudo || this.conteudo.trim() === '')) {
      throw new Error('Content is required');
    }
  }

  static create(postUuid: string, autorUuid: string, autorNome: string, conteudo: string): Comentario {
    const now = new Date();
    return new Comentario(null, null, postUuid, autorUuid, autorNome, conteudo, now, now);
  }

  get editado(): boolean {
    return !this.apagado && this.updatedAt.getTime() !== this.createdAt.getTime();
  }
}
