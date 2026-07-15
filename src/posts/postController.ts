import { Request, Response } from 'express';
import { PostService, PostNotFoundError } from './postService';
import { createPostSchema, updatePostSchema } from './postSchemas';
import { ZodError } from 'zod';
import { ErroAplicacao, CodigoErro, criarErro } from '../shared/erros';
import { logError } from '../shared/logger';
import { createSpan } from '../observability/tracing';
import { getTestUuids, ITestModeRequest, registerTestUuid } from '../shared/testModeMiddleware';
import { IAuthRequest } from '../auth/authMiddleware';

type ICreatePostRequest = ITestModeRequest & IAuthRequest;

export class PostController {
  constructor(private readonly postService: PostService) {}

  private isValidUuid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

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

  async create(req: ICreatePostRequest, res: Response): Promise<Response> {
    return createSpan('post.create', async () => {
      try {
        if (!req.usuario) {
          return res.status(401).json({
            codigo: CodigoErro.AUTHZ_NAO_AUTENTICADO,
            message: 'Usuário não autenticado',
          });
        }

        const body = { ...req.body };
        if (body.title && !body.titulo) body.titulo = body.title;
        if (body.content && !body.conteudo) body.conteudo = body.content;

        const validatedData = createPostSchema.parse(body);
        const post = await this.postService.create(validatedData, req.usuario.nome);

        if (req.isTestMode && req.testSessionId && post.uuid) {
          registerTestUuid(req.testSessionId, post.uuid);
        }
        
        const postPublico = {
          uuid: post.uuid,
          title: post.title,
          content: post.content,
          author: post.author,
          titulo: post.title,
          conteudo: post.content,
          autor: post.author,
          criadoEm: post.createdAt,
          atualizadoEm: post.updatedAt
        };
        
        return res.status(201).json({
          sucesso: true,
          dados: postPublico,
          ...postPublico
        });
      } catch (error) {
        return this.handleError(error, res);
      }
    }) as Promise<Response>;
  }

  async seed(req: ITestModeRequest, res: Response): Promise<Response> {
    return createSpan('post.seed', async () => {
      try {
        if (!req.isTestMode) {
          return res.status(403).json({
            sucesso: false,
            mensagem: 'Endpoint disponível apenas em modo de teste'
          });
        }

        const quantidade = Number(req.query.quantidade) || 5;
        const postsCriados = [];

        for (let i = 0; i < quantidade; i++) {
          const assuntos = ['React Native', 'Arquitetura', 'UI/UX', 'Performance', 'Testes E2E'];
          const assunto = assuntos[i % assuntos.length];
          const postData = {
            titulo: `Melhores Práticas: ${assunto} na Prática`,
            conteudo: `Este post explora as melhores estratégias e ferramentas para trabalhar com ${assunto}. Desde os conceitos fundamentais até otimizações avançadas, confira dicas valiosas para aprimorar seu projeto.`,
          };

          const post = await this.postService.create(postData, `Autor Teste ${i}`);
          
          if (req.testSessionId && post.uuid) {
            registerTestUuid(req.testSessionId, post.uuid);
          }

          postsCriados.push({
            uuid: post.uuid,
            title: post.title,
            content: post.content,
            author: post.author,
            titulo: post.title,
            conteudo: post.content,
            autor: post.author,
            criadoEm: post.createdAt,
            atualizadoEm: post.updatedAt
          });
        }

        return res.status(201).json({
          sucesso: true,
          dados: {
            criados: postsCriados.length,
            posts: postsCriados
          }
        });
      } catch (error) {
        return this.handleError(error, res);
      }
    }) as Promise<Response>;
  }

  async cleanup(req: ITestModeRequest, res: Response): Promise<Response> {
    return createSpan('post.cleanup', async () => {
      try {
        if (!req.isTestMode) {
          return res.status(403).json({
            sucesso: false,
            mensagem: 'Endpoint disponível apenas em modo de teste'
          });
        }

        if (req.testSessionId) {
          const testUuids = getTestUuids(req.testSessionId);
          for (const uuid of testUuids) {
            try {
              await this.postService.delete(uuid);
            } catch (error) {
              console.log(`Erro ao deletar post ${uuid}:`, error);
            }
          }
        }

        return res.status(200).json({
          sucesso: true,
          dados: {
            mensagem: 'Limpeza de dados de teste concluída'
          }
        });
      } catch (error) {
        return this.handleError(error, res);
      }
    }) as Promise<Response>;
  }

  async list(_req: Request, res: Response): Promise<Response> {
    return createSpan('post.list', async () => {
      try {
        const posts = await this.postService.listAll();
        
        const postsPublicos = posts.map(post => ({
          uuid: post.uuid,
          title: post.title,
          content: post.content,
          author: post.author,
          titulo: post.title,
          conteudo: post.content,
          autor: post.author,
          criadoEm: post.createdAt,
          atualizadoEm: post.updatedAt
        }));
        
        return res.status(200).json({
          sucesso: true,
          dados: postsPublicos
        });
      } catch (error) {
        return this.handleError(error, res);
      }
    }) as Promise<Response>;
  }

  async getById(req: Request, res: Response): Promise<Response> {
    return createSpan('post.getById', async () => {
      try {
        const { uuid } = req.params;
        
        if (!uuid || !this.isValidUuid(uuid as string)) {
          return res.status(400).json({ 
            codigo: CodigoErro.VALIDACAO_CAMPO_INVALIDO,
            message: 'ID inválido. Deve ser um UUID válido.' 
          });
        }
        
        const post = await this.postService.findByUuid(uuid as string);
        if (!post) throw new PostNotFoundError();
        
        const postPublico = {
          uuid: post.uuid,
          title: post.title,
          content: post.content,
          author: post.author,
          titulo: post.title,
          conteudo: post.content,
          autor: post.author,
          criadoEm: post.createdAt,
          atualizadoEm: post.updatedAt
        };
        
        return res.status(200).json({
          sucesso: true,
          dados: postPublico,
          ...postPublico
        });
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

        const postsPublicos = posts.map(post => ({
          uuid: post.uuid,
          title: post.title,
          content: post.content,
          author: post.author,
          titulo: post.title,
          conteudo: post.content,
          autor: post.author,
          criadoEm: post.createdAt,
          atualizadoEm: post.updatedAt
        }));

        return res.status(200).json({
          sucesso: true,
          dados: postsPublicos
        });
      } catch (error) {
        return this.handleError(error, res);
      }
    }) as Promise<Response>;
  }

  async update(req: Request, res: Response): Promise<Response> {
    return createSpan('post.update', async () => {
      try {
        const { uuid } = req.params;

        const body = { ...req.body };
        if (body.title && !body.titulo) body.titulo = body.title;
        if (body.content && !body.conteudo) body.conteudo = body.content;

        const validatedData = updatePostSchema.parse(body);
        const post = await this.postService.update(uuid as string, validatedData);
        
        const postPublico = {
          uuid: post.uuid,
          title: post.title,
          content: post.content,
          author: post.author,
          titulo: post.title,
          conteudo: post.content,
          autor: post.author,
          criadoEm: post.createdAt,
          atualizadoEm: post.updatedAt
        };
        
        return res.status(200).json({
          sucesso: true,
          dados: postPublico,
          ...postPublico
        });
      } catch (error) {
        return this.handleError(error, res);
      }
    }) as Promise<Response>;
  }

  async delete(req: Request, res: Response): Promise<Response> {
    return createSpan('post.delete', async () => {
      try {
        const { uuid } = req.params;
        await this.postService.delete(uuid as string);
        return res.status(204).send();
      } catch (error) {
        return this.handleError(error, res);
      }
    }) as Promise<Response>;
  }
}
