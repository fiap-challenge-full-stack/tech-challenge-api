import { Request, Response } from 'express';
import { PostService, PostNotFoundError } from './postService';
import { createPostSchema, updatePostSchema } from './postSchemas';
import { ZodError } from 'zod';
import { ErroAplicacao, CodigoErro, criarErro } from '../shared/erros';
import { logError } from '../shared/logger';
import { createSpan } from '../observability/tracing';

export class PostController {
  constructor(private readonly postService: PostService) {}

  private handleError(error: unknown, res: Response): Response {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        codigo: CodigoErro.VALIDACAO_CAMPO_INVALIDO,
        message: 'Falha na validação dos campos', 
        errors: error.issues.map((err) => ({ 
          field: err.path.join('.'), 
          message: err.message 
        }))
      });
    }

    if (error instanceof PostNotFoundError) {
      return res.status(404).json({ 
        codigo: CodigoErro.POST_NAO_ENCONTRADO,
        message: 'Post não encontrado' 
      });
    }

    if (error instanceof ErroAplicacao) {
      logError(error, 'PostController');
      return res.status(error.codigo === CodigoErro.POST_NAO_ENCONTRADO ? 404 : 500).json({ 
        codigo: error.codigo,
        message: error.message 
      });
    }

    logError(error instanceof Error ? error : new Error(String(error)), 'PostController');
    const erroApp = criarErro(CodigoErro.SERVIDOR_INTERNO);
    return res.status(500).json({ 
      codigo: erroApp.codigo,
      message: erroApp.message 
    });
  }

  async create(req: Request, res: Response): Promise<Response> {
    return createSpan('post.create', async () => {
      try {
        const validatedData = createPostSchema.parse(req.body);
        const post = await this.postService.create(validatedData);
        return res.status(201).json(post);
      } catch (error) {
        return this.handleError(error, res);
      }
    }) as Promise<Response>;
  }

  async list(_req: Request, res: Response): Promise<Response> {
    return createSpan('post.list', async () => {
      try {
        const posts = await this.postService.listAll();
        return res.status(200).json(posts);
      } catch (error) {
        return this.handleError(error, res);
      }
    }) as Promise<Response>;
  }

  async getById(req: Request, res: Response): Promise<Response> {
    return createSpan('post.getById', async () => {
      try {
        const { id } = req.params;
        const post = await this.postService.findByUuid(id as string);
        if (!post) throw new PostNotFoundError();
        return res.status(200).json(post);
      } catch (error) {
        return this.handleError(error, res);
      }
    }) as Promise<Response>;
  }

  async search(req: Request, res: Response): Promise<Response> {
    return createSpan('post.search', async () => {
      try {
        const { q } = req.query;
        const posts = await this.postService.search(q as string || '');
        return res.status(200).json(posts);
      } catch (error) {
        return this.handleError(error, res);
      }
    }) as Promise<Response>;
  }

  async update(req: Request, res: Response): Promise<Response> {
    return createSpan('post.update', async () => {
      try {
        const { id } = req.params;
        const validatedData = updatePostSchema.parse(req.body);
        const post = await this.postService.update(id as string, validatedData);
        return res.status(200).json(post);
      } catch (error) {
        return this.handleError(error, res);
      }
    }) as Promise<Response>;
  }

  async delete(req: Request, res: Response): Promise<Response> {
    return createSpan('post.delete', async () => {
      try {
        const { id } = req.params;
        await this.postService.delete(id as string);
        return res.status(204).send();
      } catch (error) {
        return this.handleError(error, res);
      }
    }) as Promise<Response>;
  }
}
