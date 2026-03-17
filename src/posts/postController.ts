import { Request, Response } from 'express';
import { PostService, PostNotFoundError } from './postService';
import { createPostSchema, updatePostSchema } from './postSchemas';
import { ZodError } from 'zod';

export class PostController {
  constructor(private readonly postService: PostService) {}

  private handleError(error: unknown, res: Response): Response {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Falha na validação dos campos', 
        errors: error.issues.map((err) => ({ 
          field: err.path.join('.'), 
          message: err.message 
        }))
      });
    }

    if (error instanceof PostNotFoundError) {
      return res.status(404).json({ message: error.message });
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(400).json({ message });
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const validatedData = createPostSchema.parse(req.body);
      const post = await this.postService.create(validatedData);
      return res.status(201).json(post);
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async list(_req: Request, res: Response): Promise<Response> {
    const posts = await this.postService.listAll();
    return res.status(200).json(posts);
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const post = await this.postService.findById(id as string);
      if (!post) throw new PostNotFoundError();
      return res.status(200).json(post);
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async search(req: Request, res: Response): Promise<Response> {
    const { q } = req.query;
    const posts = await this.postService.search(q as string || '');
    return res.status(200).json(posts);
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const validatedData = updatePostSchema.parse(req.body);
      const post = await this.postService.update(id as string, validatedData);
      return res.status(200).json(post);
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      await this.postService.delete(id as string);
      return res.status(204).send();
    } catch (error) {
      return this.handleError(error, res);
    }
  }
}
