import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de usuários...');

  const senhaHash = await bcrypt.hash('senha123', 10);

  const docente1 = await prisma.usuario.upsert({
    where: { email: 'docente1@fiap.com.br' },
    update: {},
    create: {
      email: 'docente1@fiap.com.br',
      senha: senhaHash,
      nome: 'Professor João Silva',
      papel: 'docente',
    },
  });

  const docente2 = await prisma.usuario.upsert({
    where: { email: 'docente2@fiap.com.br' },
    update: {},
    create: {
      email: 'docente2@fiap.com.br',
      senha: senhaHash,
      nome: 'Professora Maria Santos',
      papel: 'docente',
    },
  });

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@fiap.com.br' },
    update: {},
    create: {
      email: 'admin@fiap.com.br',
      senha: senhaHash,
      nome: 'Administrador',
      papel: 'admin',
    },
  });

  console.log('Seed concluído com sucesso!');
  console.log('Usuários criados:');
  console.log(`- ${docente1.email} (senha: senha123)`);
  console.log(`- ${docente2.email} (senha: senha123)`);
  console.log(`- ${admin.email} (senha: senha123)`);

  console.log('Iniciando seed de posts...');

  const posts = [
    {
      title: 'Arquitetura Limpa em React Native',
      content: 'Neste artigo, vamos explorar como implementar uma arquitetura limpa e escalável em aplicações React Native usando TypeScript, focando na separação de responsabilidades e na criação de componentes reutilizáveis.',
      author: docente1.nome,
    },
    {
      title: 'Gerenciamento de Estado Global: Context API vs Redux',
      content: 'Uma análise profunda das diferenças entre a Context API nativa do React e o Redux. Quando usar cada um? Quais os trade-offs de performance e complexidade de manutenção em projetos de grande porte?',
      author: docente2.nome,
    },
    {
      title: 'Acessibilidade em Aplicações Mobile',
      content: 'Por que acessibilidade não é apenas "algo a mais"? Descubra como tornar seu app React Native amigável para leitores de tela e atender a uma parcela importante de usuários através do VoiceOver e TalkBack.',
      author: docente1.nome,
    },
    {
      title: 'Navegação Avançada com Expo Router',
      content: 'O Expo Router mudou a forma como criamos rotas no mobile. Aprenda a estruturar um app complexo com abas, modais e telas protegidas (auth-flow) usando o file-based routing do Expo.',
      author: docente2.nome,
    },
    {
      title: 'Otimização de Imagens e Performance',
      content: 'Imagens grandes são a principal causa de lentidão e travamentos. Vamos ver técnicas de caching, lazy loading e resize utilizando as bibliotecas mais modernas disponíveis para Expo.',
      author: docente1.nome,
    }
  ];

  for (const post of posts) {
    await prisma.post.create({
      data: post
    });
  }

  console.log(`${posts.length} posts criados com sucesso!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
