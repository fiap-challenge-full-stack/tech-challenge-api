import { PrismaClient } from '@prisma/client';
import { ISeguidorRepository } from './seguidorRepository';
import { Seguidor } from './seguidor';

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

  async listarSeguindo(seguidorUuid: string): Promise<string[]> {
    const data = await this.prisma.seguidor.findMany({
      where: { seguidorUuid },
      select: { seguidoUuid: true },
    });
    return data.map((s: { seguidoUuid: string }) => s.seguidoUuid);
  }

  async listarSeguidores(seguidoUuid: string): Promise<string[]> {
    const data = await this.prisma.seguidor.findMany({
      where: { seguidoUuid },
      select: { seguidorUuid: true },
    });
    return data.map((s: { seguidorUuid: string }) => s.seguidorUuid);
  }
}
