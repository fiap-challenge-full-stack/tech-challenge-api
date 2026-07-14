import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Limpando base de dados anterior...');
  await prisma.comentario.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.usuario.deleteMany({});

  console.log('Iniciando seed de 30 usuários...');
  const senhaHash = await bcrypt.hash('senha123', 10);

  const rawUsers = [
    // Docentes (5)
    { nome: 'Professor João Silva', email: 'docente1@fiap.com.br', papel: 'docente' },
    { nome: 'Professora Maria Santos', email: 'docente2@fiap.com.br', papel: 'docente' },
    { nome: 'Professor Ricardo Melo', email: 'ricardo.melo@fiap.com.br', papel: 'docente' },
    { nome: 'Professora Ana Clara', email: 'anaclara@fiap.com.br', papel: 'docente' },
    { nome: 'Professor André Santos', email: 'andre.santos@fiap.com.br', papel: 'docente' },
    // Admin (1)
    { nome: 'Administrador', email: 'admin@fiap.com.br', papel: 'admin' },
    // Alunos (24)
    { nome: 'Lucas Lima', email: 'lucas.lima@fiap.com.br', papel: 'aluno' },
    { nome: 'Ana Souza', email: 'ana.souza@fiap.com.br', papel: 'aluno' },
    { nome: 'Carlos Oliveira', email: 'carlos.oliveira@fiap.com.br', papel: 'aluno' },
    { nome: 'Juliana Costa', email: 'juliana.costa@fiap.com.br', papel: 'aluno' },
    { nome: 'Mateus Pereira', email: 'mateus.pereira@fiap.com.br', papel: 'aluno' },
    { nome: 'Beatriz Rodrigues', email: 'beatriz.rodrigues@fiap.com.br', papel: 'aluno' },
    { nome: 'Felipe Almeida', email: 'felipe.almeida@fiap.com.br', papel: 'aluno' },
    { nome: 'Camila Gomes', email: 'camila.gomes@fiap.com.br', papel: 'aluno' },
    { nome: 'Thiago Martins', email: 'thiago.martins@fiap.com.br', papel: 'aluno' },
    { nome: 'Larissa Rocha', email: 'larissa.rocha@fiap.com.br', papel: 'aluno' },
    { nome: 'Gustavo Dias', email: 'gustavo.dias@fiap.com.br', papel: 'aluno' },
    { nome: 'Mariana Silva', email: 'mariana.silva@fiap.com.br', papel: 'aluno' },
    { nome: 'Rodrigo Santos', email: 'rodrigo.santos@fiap.com.br', papel: 'aluno' },
    { nome: 'Amanda Cruz', email: 'amanda.cruz@fiap.com.br', papel: 'aluno' },
    { nome: 'Daniel Ribeiro', email: 'daniel.ribeiro@fiap.com.br', papel: 'aluno' },
    { nome: 'Patricia Neves', email: 'patricia.neves@fiap.com.br', papel: 'aluno' },
    { nome: 'Gabriel Fernandes', email: 'gabriel.fernandes@fiap.com.br', papel: 'aluno' },
    { nome: 'Aline Vieira', email: 'aline.vieira@fiap.com.br', papel: 'aluno' },
    { nome: 'Pedro Souza', email: 'pedro.souza@fiap.com.br', papel: 'aluno' },
    { nome: 'Sofia Cardoso', email: 'sofia.cardoso@fiap.com.br', papel: 'aluno' },
    { nome: 'Bruno Barbosa', email: 'bruno.barbosa@fiap.com.br', papel: 'aluno' },
    { nome: 'Leticia Ramos', email: 'leticia.ramos@fiap.com.br', papel: 'aluno' },
    { nome: 'Vitor Castro', email: 'vitor.castro@fiap.com.br', papel: 'aluno' },
    { nome: 'Clara Pinheiro', email: 'clara.pinheiro@fiap.com.br', papel: 'aluno' }
  ];

  const usuarios: any[] = [];
  for (const raw of rawUsers) {
    const user = await prisma.usuario.create({
      data: {
        nome: raw.nome,
        email: raw.email,
        senha: senhaHash,
        papel: raw.papel
      }
    });
    usuarios.push(user);
  }

  console.log('30 usuários criados com sucesso.');

  console.log('Iniciando seed de posts...');
  const postsData = [
    {
      title: 'Arquitetura Limpa em React Native',
      content: 'Neste artigo, vamos explorar como implementar uma arquitetura limpa e escalável em aplicações React Native usando TypeScript, focando na separação de responsabilidades e na criação de componentes reutilizáveis.',
      author: 'Professor João Silva',
    },
    {
      title: 'Gerenciamento de Estado Global: Context API vs Redux',
      content: 'Uma análise profunda das diferenças entre a Context API nativa do React e o Redux. Quando usar cada um? Quais os trade-offs de performance e complexidade de manutenção em projetos de grande porte?',
      author: 'Professora Maria Santos',
    },
    {
      title: 'Acessibilidade em Aplicações Mobile',
      content: 'Por que acessibilidade não é apenas "algo a mais"? Descubra como tornar seu app React Native amigável para leitores de tela e atender a uma parcela importante de usuários através do VoiceOver e TalkBack.',
      author: 'Professor João Silva',
    },
    {
      title: 'Navegação Avançada com Expo Router',
      content: 'O Expo Router mudou a forma como criamos rotas no mobile. Aprenda a estruturar um app complexo com abas, modais e telas protegidas (auth-flow) usando o file-based routing do Expo.',
      author: 'Professora Maria Santos',
    },
    {
      title: 'Otimização de Imagens e Performance',
      content: 'Imagens grandes são a principal causa de lentidão e travamentos. Vamos ver técnicas de caching, lazy loading e resize utilizando as bibliotecas mais modernas disponíveis para Expo.',
      author: 'Professor João Silva',
    }
  ];

  const posts: any[] = [];
  for (const post of postsData) {
    const createdPost = await prisma.post.create({
      data: post
    });
    posts.push(createdPost);
  }
  console.log(`${posts.length} posts criados com sucesso!`);

  console.log('Iniciando seed de comentários...');
  
  const commentTexts = [
    "Excelente reflexão sobre o assunto!",
    "Muito bom! Essa parte de arquitetura sempre me confunde um pouco.",
    "Obrigado por compartilhar o conhecimento, ajudou demais.",
    "Excelente didática, professor(a)!",
    "Teremos algum projeto prático aplicando este conceito?",
    "Gostei muito dos exemplos utilizados no texto.",
    "Parabéns pelo post! Recomendei para outros colegas da turma.",
    "Esse conteúdo vai cair na avaliação desta semana?",
    "Interessante como a performance muda dependendo da abordagem.",
    "Achei o tema de extrema relevância para a atualidade.",
    "Como podemos aprofundar esse estudo além do artigo?",
    "O código fonte desse exemplo está disponível no GitHub?",
    "Muito interessante ver esse ponto de vista sobre o tema.",
    "Excelente texto. Adicionei aos meus favoritos.",
    "Sensacional! Ficou super claro a explicação."
  ];

  for (const post of posts) {
    const postAuthor = post.author;
    const postUuid = post.uuid;

    // Achar os registros do autor do post
    const authorUser = usuarios.find(u => u.nome === postAuthor) || usuarios[0];
    // Pegar o usuario logado padrao (Professor João Silva)
    const loggedInUser = usuarios.find(u => u.email === 'docente1@fiap.com.br') || usuarios[1];

    // Número aleatório entre 5 e 15 comentários
    const numComments = Math.floor(Math.random() * (15 - 5 + 1)) + 5;
    const commentsToCreate: any[] = [];

    // 1. Sempre garantir o comentário do autor do post
    commentsToCreate.push({
      postUuid,
      autorUuid: authorUser.uuid,
      autorNome: authorUser.nome,
      conteudo: `Obrigado a todos pelo interesse e comentários neste post sobre ${post.title}!`
    });

    // 2. Sempre garantir o comentário do usuário logado padrão
    if (authorUser.uuid !== loggedInUser.uuid) {
      commentsToCreate.push({
        postUuid,
        autorUuid: loggedInUser.uuid,
        autorNome: loggedInUser.nome,
        conteudo: `Excelente contribuição para a comunidade! ${post.title} é fundamental.`
      });
    }

    // 3. Completar com comentários de usuários aleatórios até atingir numComments
    while (commentsToCreate.length < numComments) {
      const randomUser = usuarios[Math.floor(Math.random() * usuarios.length)];
      const randomText = commentTexts[Math.floor(Math.random() * commentTexts.length)];
      
      commentsToCreate.push({
        postUuid,
        autorUuid: randomUser.uuid,
        autorNome: randomUser.nome,
        conteudo: randomText
      });
    }

    for (const c of commentsToCreate) {
      await prisma.comentario.create({
        data: c
      });
    }
  }

  console.log('Comentários de seed criados com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
