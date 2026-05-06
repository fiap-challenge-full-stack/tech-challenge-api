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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
