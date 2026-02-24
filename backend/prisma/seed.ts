import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@netcontrol.com.br';
  const adminPassword = 'admin'; // Troque para uma senha segura

  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.admin.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
      },
    });
    console.log(`✅ Admin master criado com sucesso! (${adminEmail})`);
  } else {
    console.log('⚠️ Admin master já existe. Seed ignorado.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
