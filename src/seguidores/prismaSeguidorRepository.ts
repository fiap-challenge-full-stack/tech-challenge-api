import { PrismaClient } from '@prisma/client';
import { ISeguidorRepository } from './seguidorRepository';
import { Seguidor } from './seguidor';
import { Usuario } from '../auth/usuario';

export class PrismaSeguidorRepository implements ISeguidorRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async seguir(seguidorUuid: string, seguidoUuid: string): Promise<Seguidor> {
    const data = await this.prisma.seguidor.create({
      data: {
        seguidorUuid,
        seguidoUuid,
      },
    });
    return new Seguidor(data.uuid, data.seguidorUuid, data.seguidoUuid, data.createdAt);
  }

  async deixarDeSeguir(seguidorUuid: string, seguidoUuid: string): Promise<void> {
    await this.prisma.seguidor.delete({
      where: {
        seguidorUuid_seguidoUuid: {
          seguidorUuid,
          seguidoUuid,
        },
      },
    });
  }

  async buscarPorSeguidorESeguido(seguidorUuid: string, seguidoUuid: string): Promise<Seguidor | null> {
    const data = await this.prisma.seguidor.findUnique({
      where: {
        seguidorUuid_seguidoUuid: {
          seguidorUuid,
          seguidoUuid,
        },
      },
    });
    if (!data) return null;
    return new Seguidor(data.uuid, data.seguidorUuid, data.seguidoUuid, data.createdAt);
  }

  async listarSeguindo(seguidorUuid: string): Promise<Usuario[]> {
    const data = await this.prisma.seguidor.findMany({
      where: { seguidorUuid },
      include: { seguido: true },
      take: 200,
    });
    return data.map((s) => new Usuario(s.seguido));
  }

  async listarSeguidores(seguidoUuid: string): Promise<string[]> {
    const data = await this.prisma.seguidor.findMany({
      where: { seguidoUuid },
      select: { seguidorUuid: true },
      take: 200,
    });
    return data.map((s: { seguidorUuid: string }) => s.seguidorUuid);
  }
}
