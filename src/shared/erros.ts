export enum CodigoErro {
  // Erros de Autenticação
  AUTH_CREDENCIAIS_INVALIDAS = 'AUTH_001',
  AUTH_TOKEN_INVALIDO = 'AUTH_002',
  AUTH_TOKEN_EXPIRADO = 'AUTH_003',
  AUTH_TOKEN_NAO_FORNECIDO = 'AUTH_004',
  AUTH_USUARIO_JA_EXISTE = 'AUTH_005',
  
  // Erros de Autorização
  AUTHZ_PERMISSAO_INSUFICIENTE = 'AUTHZ_001',
  AUTHZ_NAO_AUTENTICADO = 'AUTHZ_002',
  
  // Erros de Posts
  POST_NAO_ENCONTRADO = 'POST_001',
  POST_TITULO_INVALIDO = 'POST_002',
  POST_CONTEUDO_INVALIDO = 'POST_003',
  POST_AUTOR_INVALIDO = 'POST_004',
  POST_CAMPOS_OBRIGATORIOS = 'POST_005',
  
  // Erros de Validação
  VALIDACAO_CAMPO_INVALIDO = 'VAL_001',
  VALIDACAO_FORMATO_INVALIDO = 'VAL_002',
  VALIDACAO_TAMANHO_INVALIDO = 'VAL_003',
  
  // Erros de Servidor
  SERVIDOR_INTERNO = 'SRV_001',
  SERVIDOR_INDISPONIVEL = 'SRV_002',
}

export interface DetalhesErro {
  codigo: CodigoErro;
  mensagem: string;
  detalhes?: unknown;
}

export class ErroAplicacao extends Error {
  constructor(
    public readonly codigo: CodigoErro,
    mensagem: string,
    public readonly detalhes?: unknown
  ) {
    super(mensagem);
    this.name = 'ErroAplicacao';
  }

  toJSON(): DetalhesErro {
    return {
      codigo: this.codigo,
      mensagem: this.message,
      detalhes: this.detalhes,
    };
  }
}

export const mensagensErro: Record<CodigoErro, string> = {
  [CodigoErro.AUTH_CREDENCIAIS_INVALIDAS]: 'Credenciais inválidas',
  [CodigoErro.AUTH_TOKEN_INVALIDO]: 'Token inválido',
  [CodigoErro.AUTH_TOKEN_EXPIRADO]: 'Token expirado',
  [CodigoErro.AUTH_TOKEN_NAO_FORNECIDO]: 'Token não fornecido',
  [CodigoErro.AUTH_USUARIO_JA_EXISTE]: 'Usuário já existe',
  [CodigoErro.AUTHZ_PERMISSAO_INSUFICIENTE]: 'Permissão insuficiente',
  [CodigoErro.AUTHZ_NAO_AUTENTICADO]: 'Usuário não autenticado',
  [CodigoErro.POST_NAO_ENCONTRADO]: 'Post não encontrado',
  [CodigoErro.POST_TITULO_INVALIDO]: 'Título inválido',
  [CodigoErro.POST_CONTEUDO_INVALIDO]: 'Conteúdo inválido',
  [CodigoErro.POST_AUTOR_INVALIDO]: 'Autor inválido',
  [CodigoErro.POST_CAMPOS_OBRIGATORIOS]: 'Campos obrigatórios não fornecidos',
  [CodigoErro.VALIDACAO_CAMPO_INVALIDO]: 'Campo inválido',
  [CodigoErro.VALIDACAO_FORMATO_INVALIDO]: 'Formato inválido',
  [CodigoErro.VALIDACAO_TAMANHO_INVALIDO]: 'Tamanho inválido',
  [CodigoErro.SERVIDOR_INTERNO]: 'Erro interno do servidor',
  [CodigoErro.SERVIDOR_INDISPONIVEL]: 'Servidor indisponível',
};

export function criarErro(codigo: CodigoErro, detalhes?: unknown): ErroAplicacao {
  return new ErroAplicacao(codigo, mensagensErro[codigo], detalhes);
}
