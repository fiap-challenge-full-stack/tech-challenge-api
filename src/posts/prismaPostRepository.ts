import { IPostPersistence, PostMapper } from './postMapper';
import { Post } from './post';
import { IPostRepository } from './postRepository';
import { prisma } from '@/lib/prisma';

export class PrismaPostRepository implements IPostRepository {
  async create(post: Post): Promise<Post> {
    const created = await prisma.post.create({
      data: {
        title: post.title,
        content: post.content,
        author: post.author,
      },
    });
    return PostMapper.toDomain(created as IPostPersistence);
  }

  async findById(uuid: string): Promise<Post | null> {
    const found = await prisma.post.findUnique({
      where: { uuid },
    });
    if (!found) return null;
    return PostMapper.toDomain(found as IPostPersistence);
  }

  async findAll(): Promise<Post[]> {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return posts.map((p: IPostPersistence) => PostMapper.toDomain(p));
  }

  async update(post: Post): Promise<Post> {
    if (!post.uuid) throw new Error('Post UUID is required for update');
    const updated = await prisma.post.update({
      where: { uuid: post.uuid },
      data: {
        title: post.title,
        content: post.content,
        author: post.author,
      },
    });
    return PostMapper.toDomain(updated as IPostPersistence);
  }

  async delete(uuid: string): Promise<void> {
    await prisma.post.delete({
      where: { uuid },
    });
  }

  async search(query: string): Promise<Post[]> {
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
    return posts.map((p: IPostPersistence) => PostMapper.toDomain(p));
  }
}
