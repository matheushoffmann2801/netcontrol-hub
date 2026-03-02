import 'dotenv/config';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs'; // Added
import multer from 'multer'; // Added
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const prisma = new PrismaClient();
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Servir frontend estático em produção (Coolify)
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET;

if (!JWT_SECRET || !JWT_ADMIN_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET e JWT_ADMIN_SECRET não configurados no arquivo .env.');
  process.exit(1);
}

// ==========================================
// MIDDLEWARE DE AUTENTICAÇÃO DO ADMIN
// ==========================================
const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_ADMIN_SECRET);
    (req as any).admin = decoded; // Adiciona as informações do admin logado ao request
    next();
  } catch (error) {
    res.status(401).json({ error: 'Acesso negado. Token inválido ou expirado.' });
    return;
  }
};

// ==========================================
// ROTA DE LOGIN DO ADMIN
// ==========================================
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Muitas tentativas falhas. Conta bloqueada temporariamente após 5 tentativas. Tente em 15 minutos.' }
});

app.post('/api/auth/login', loginLimiter, async (req: any, res: any) => {
  try {
    const email = req.body.email?.trim();
    const password = req.body.password;

    console.log(`[LOGIN] Tentativa de login para: '${email}'`);

    // 1. Verificar se o admin existe
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      console.log(`[LOGIN] Erro: admin não encontrado (${email})`);
      res.status(401).json({ error: 'Credenciais inválidas. Admin não encontrado.' });
      return;
    }

    // 2. Verificar se a senha confere
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      console.log(`[LOGIN] Erro: senha incorreta (${email})`);
      res.status(401).json({ error: 'Credenciais inválidas. Senha incorreta.' });
      return;
    }

    console.log(`[LOGIN] Sucesso para: '${email}'`);
    // 3. Gerar o JWT do Admin (Diferente da licença das empresas)
    const token = jwt.sign(
      { id: admin.id, role: 'ADMIN' },
      JWT_ADMIN_SECRET,
      { expiresIn: '1d' } // Token válido por 1 dia
    );

    res.json({
      message: 'Login bem-sucedido',
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name }
    });
    return;
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
    return;
  }
});

// ==========================================
// MIDDLEWARE: VALIDAR ADMIN
// ==========================================
const requireAdmin = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_ADMIN_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
  }
};

// ==========================================
// GET /auth/me - Validar Sessão
// ==========================================
app.get('/api/auth/me', requireAdmin, async (req: any, res: any) => {
  try {
    const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } });
    if (!admin) return res.status(401).json({ error: 'Admin não encontrado.' });
    res.json({ id: admin.id, email: admin.email, name: admin.name });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// ==========================================
// GET /stats - Estatísticas para o Dashboard
// ==========================================
app.get('/api/stats', requireAdmin, async (req: any, res: any) => {
  try {
    const companies = await prisma.company.findMany();

    // Contar empresas ativas vs canceladas/suspensas
    const activeCompanies = companies.filter((c: any) => c.status !== 'CANCELED' && c.status !== 'SUSPENDED').length;

    let onlineInstances = 0;
    const now = new Date().getTime();
    const onlineCompanyIds: string[] = [];

    companies.forEach((c: any) => {
      if (c.lastSeenAt) {
        const diffMs = now - new Date(c.lastSeenAt).getTime();
        // Considerado online se o último ping foi há menos de 10 minutos
        if (diffMs < 10 * 60 * 1000) {
          onlineInstances++;
          if (c.status === 'ACTIVE') {
            onlineCompanyIds.push(c.id);
          }
        }
      }
    });

    let avgCpu = 0;
    let avgRam = 0;
    let totalUsers = 0;

    if (onlineCompanyIds.length > 0) {
      const latestTelemetries = await Promise.all(
        onlineCompanyIds.map((id: string) => prisma.telemetry.findFirst({
          where: { companyId: id },
          orderBy: { timestamp: 'desc' }
        }))
      );

      let validTels = 0;
      latestTelemetries.forEach((t: any) => {
        if (t) {
          avgCpu += t.cpuUsage;
          avgRam += t.ramUsage;
          totalUsers += t.activeUsers;
          validTels++;
        }
      });

      if (validTels > 0) {
        avgCpu = Math.round(avgCpu / validTels);
        avgRam = Math.round(avgRam / validTels);
      }
    }

    // Calcular total de módulos ativos (parsing do JSON de cada licença mais recente)
    let totalActiveModules = 0;
    for (const company of companies) {
      if (company.status === 'ACTIVE') {
        const lastLicense = await prisma.license.findFirst({
          where: { companyId: company.id },
          orderBy: { createdAt: 'desc' }
        });
        if (lastLicense) {
          try {
            const mods = JSON.parse(lastLicense.modules);
            if (Array.isArray(mods)) {
              totalActiveModules += mods.length;
            }
          } catch (e) {
            console.error(`Erro ao parsear módulos da empresa ${company.id}`);
          }
        }
      }
    }

    res.status(200).json({
      activeCompanies,
      onlineInstances,
      offlineInstances: companies.length - onlineInstances,
      totalActiveModules,
      telemetry: {
        avgCpu,
        avgRam,
        totalUsers
      },
      growthData: [
        { name: 'Jan', active: Math.floor(activeCompanies * 0.2) },
        { name: 'Fev', active: Math.floor(activeCompanies * 0.4) },
        { name: 'Mar', active: Math.floor(activeCompanies * 0.6) },
        { name: 'Abr', active: Math.floor(activeCompanies * 0.8) },
        { name: 'Mai', active: Math.floor(activeCompanies * 0.9) },
        { name: 'Jun', active: activeCompanies },
      ]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

app.get('/api/companies', requireAdmin, async (req: any, res: any) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        licenses: true, // Inclui a licença relacionada
        customization: true, // Inclui a personalização
      },
      orderBy: {
        name: 'asc' // Ordena por nome
      }
    });

    const now = new Date().getTime();
    const tenMinutes = 10 * 60 * 1000;

    // O campo 'modules' na licença é uma string JSON, vamos fazer o parse
    const companiesWithParsedModules = companies.map((company: any) => {
      const companyCopy = { ...company };

      // Calculate isOnline
      companyCopy.isOnline = false;
      if (company.lastSeenAt) {
        const diffMs = now - new Date(company.lastSeenAt).getTime();
        if (diffMs < tenMinutes && company.status === 'ACTIVE') {
          companyCopy.isOnline = true;
        }
      }

      if (company.licenses && company.licenses.length > 0 && typeof company.licenses[0].modules === 'string') {
        // Criamos uma cópia para evitar mutação direta do objeto do Prisma
        const licenseCopy = { ...company.licenses[0] };
        licenseCopy.modules = JSON.parse(licenseCopy.modules);
        delete (licenseCopy as any).token; // Remove o JWT token do payload por segurança
        companyCopy.licenses = [licenseCopy];
      }
      return companyCopy;
    });


    res.status(200).json(companiesWithParsedModules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar empresas' });
  }
});

app.post('/api/companies', requireAdmin, async (req: any, res: any) => {
  try {
    const { name, document, modules, systemName, primaryColor, logoUrl } = req.body;

    // 1. Cria a empresa e as personalizações no banco
    const company = await prisma.company.create({
      data: {
        name,
        document,
        customization: {
          create: {
            systemName: systemName || 'NetControl',
            primaryColor: primaryColor || '#000000',
            logoUrl: logoUrl || null,
          }
        }
      }
    });

    // 2. Define a validade do Token (ex: 30 dias a partir de hoje)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // 3. Monta o Payload (o que vai dentro do Token JWT)

    const tokenPayload = {
      companyId: company.id,
      companyName: company.name,
      serial: company.document, // Using document as serial for now
      modules: modules, // ex: ["FINANCE", "SUPPORT"]
      exp: Math.floor(expiresAt.getTime() / 1000) // JWT usa segundos
    };

    // 4. Assina o Token com a nossa Chave Mestra
    const token = jwt.sign(tokenPayload, JWT_SECRET);

    // 5. Salva a licença no banco atrelada à empresa
    const license = await prisma.license.create({
      data: {
        companyId: company.id,
        token: token,
        expiresAt: expiresAt,
        modules: JSON.stringify(modules)
      }
    });

    // 6. Registra no AuditLog
    await prisma.auditLog.create({
      data: {
        companyId: company.id,
        action: 'COMPANY_CREATED',
        details: 'Empresa e licença inicial criadas com sucesso',
        ip: req.ip || req.socket.remoteAddress || 'unknown'
      }
    });

    res.status(201).json({
      message: 'Empresa e Licença criadas com sucesso!',
      companyId: company.id,
      token: token,
      expiresAt: expiresAt
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar empresa e licença' });
  }
});

// ==========================================
// GET /companies/:id - Detalhes de uma empresa
// ==========================================
app.get('/api/companies/:id', requireAdmin, async (req: any, res: any) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: { licenses: true, customization: true }
    });
    if (!company) {
      res.status(404).json({ error: 'Empresa não encontrada' });
      return;
    }
    // Parse modules
    const companyCopy = { ...company } as any;

    // Calculate isOnline
    companyCopy.isOnline = false;
    if (companyCopy.lastSeenAt) {
      const diffMs = new Date().getTime() - new Date(companyCopy.lastSeenAt).getTime();
      if (diffMs < 10 * 60 * 1000 && companyCopy.status === 'ACTIVE') {
        companyCopy.isOnline = true;
      }
    }

    if (companyCopy.licenses && companyCopy.licenses.length > 0 && typeof companyCopy.licenses[0].modules === 'string') {
      companyCopy.licenses = companyCopy.licenses.map((l: any) => ({ ...l, modules: JSON.parse(l.modules) }));
    }
    res.json(companyCopy);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar empresa' });
  }
});

// ==========================================
// GET /companies/:id/logs - Histórico de Auditoria
// ==========================================
app.get('/api/companies/:id/logs', requireAdmin, async (req: any, res: any) => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { companyId: req.params.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar logs da empresa' });
  }
});

// ==========================================
// GET /companies/:id/telemetry - Histórico de Telemetria
// ==========================================
app.get('/api/companies/:id/telemetry', requireAdmin, async (req: any, res: any) => {
  try {
    const telemetry = await prisma.telemetry.findMany({
      where: { companyId: req.params.id },
      orderBy: { timestamp: 'asc' }, // Retorna ordenado do mais antigo pro mais novo (melhor pro chart de linha)
      take: 50 // limitamos às ultimas 50 leituras
    });
    res.json(telemetry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar telemetria da empresa' });
  }
});

// ==========================================
// PUT /companies/:id - Atualizar empresa
// ==========================================
app.put('/api/companies/:id', requireAdmin, async (req: any, res: any) => {
  try {
    const { name, document, status, systemName, primaryColor, logoUrl } = req.body;

    const currentCompany = await prisma.company.findUnique({ where: { id: req.params.id } });
    if (!currentCompany) {
      res.status(404).json({ error: 'Empresa não encontrada' });
      return;
    }

    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: {
        name,
        document,
        status,
        customization: {
          update: {
            systemName,
            primaryColor,
            logoUrl,
          }
        }
      },
      include: { customization: true, licenses: true }
    });

    if (currentCompany.status !== status) {
      await prisma.auditLog.create({
        data: {
          companyId: req.params.id,
          action: 'STATUS_CHANGED',
          details: `Status alterado de ${currentCompany.status} para ${status}`,
          ip: req.ip || req.socket.remoteAddress || 'unknown'
        }
      });
    } else {
      await prisma.auditLog.create({
        data: {
          companyId: req.params.id,
          action: 'COMPANY_UPDATED',
          details: `Informações da empresa atualizadas`,
          ip: req.ip || req.socket.remoteAddress || 'unknown'
        }
      });
    }

    // Verifica se a empresa teve alteração de nome ou documento para forçar re-geração de licença se possível
    let lastTokenGenerated = undefined;
    if (currentCompany.name !== name || currentCompany.document !== document) {
      const lastLicense = await prisma.license.findFirst({
        where: { companyId: req.params.id },
        orderBy: { createdAt: 'desc' }
      });
      if (lastLicense) {
        const expTime = new Date(lastLicense.expiresAt);
        if (expTime > new Date()) { // Só re-emite se a licença não estiver expirada
          const modulesArr = JSON.parse(lastLicense.modules);
          const tokenPayload = {
            companyId: company.id,
            companyName: company.name,
            serial: company.document,
            modules: modulesArr,
            exp: Math.floor(expTime.getTime() / 1000)
          };
          const token = jwt.sign(tokenPayload, JWT_SECRET);
          const newLic = await prisma.license.create({
            data: {
              companyId: company.id,
              token,
              expiresAt: expTime,
              modules: JSON.stringify(modulesArr)
            }
          });
          lastTokenGenerated = token;
          await prisma.auditLog.create({
            data: {
              companyId: req.params.id,
              action: 'LICENSE_UPDATED',
              details: `Nova licença gerada devido a alteração cadastral.`,
              ip: req.ip || req.socket.remoteAddress || 'unknown'
            }
          });
        }
      }
    }

    res.json({ message: 'Empresa atualizada com sucesso!', company, newToken: lastTokenGenerated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar empresa' });
  }
});

// ==========================================
// DELETE /companies/:id - Remover empresa
// ==========================================
app.delete('/api/companies/:id', requireAdmin, async (req: any, res: any) => {
  try {
    // Remove TODAS as relações primeiro (ordem importa para FK constraints)
    await prisma.telemetry.deleteMany({ where: { companyId: req.params.id } });
    await prisma.auditLog.deleteMany({ where: { companyId: req.params.id } });
    await prisma.license.deleteMany({ where: { companyId: req.params.id } });
    await prisma.customization.deleteMany({ where: { companyId: req.params.id } });
    await prisma.company.delete({ where: { id: req.params.id } });
    res.json({ message: 'Empresa e todos os dados relacionados removidos com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao remover empresa' });
  }
});

// ==========================================
// POST /companies/:id/renew - Renovar Licença
// ==========================================
app.post('/api/companies/:id/renew', requireAdmin, async (req: any, res: any) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: { licenses: true }
    });
    if (!company) {
      res.status(404).json({ error: 'Empresa não encontrada' });
      return;
    }

    const lastLicense = company.licenses[company.licenses.length - 1];
    const modulesArr = lastLicense ? JSON.parse(lastLicense.modules) : [];

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const tokenPayload = {
      companyId: company.id,
      companyName: company.name,
      serial: company.document,
      modules: modulesArr,
      exp: Math.floor(expiresAt.getTime() / 1000)
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET);

    const license = await prisma.license.create({
      data: {
        companyId: company.id,
        token,
        expiresAt,
        modules: JSON.stringify(modulesArr)
      }
    });

    await prisma.auditLog.create({
      data: {
        companyId: company.id,
        action: 'LICENSE_RENEWED',
        details: `Licença renovada até ${expiresAt.toISOString()}`,
        ip: req.ip || req.socket.remoteAddress || 'unknown'
      }
    });

    res.status(201).json({
      message: 'Licença renovada com sucesso!',
      token,
      expiresAt,
      license
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao renovar licença' });
  }
});

// ==========================================
// PUT /companies/:id/modules - Alterar Módulos
// ==========================================
app.put('/api/companies/:id/modules', requireAdmin, async (req: any, res: any) => {
  try {
    const { modules } = req.body;

    if (!Array.isArray(modules)) {
      res.status(400).json({ error: 'Formato de módulos inválido.' });
      return;
    }

    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: { licenses: true }
    });

    if (!company) {
      res.status(404).json({ error: 'Empresa não encontrada' });
      return;
    }

    const lastLicense = company.licenses[company.licenses.length - 1];

    // Se não houver licença ativa, definimos expiração para 30 dias a partir de agora
    let expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    if (lastLicense && new Date(lastLicense.expiresAt) > new Date()) {
      expiresAt = new Date(lastLicense.expiresAt); // Mantém a mesma data de expiração
    }

    const tokenPayload = {
      companyId: company.id,
      companyName: company.name,
      serial: company.document,
      modules: modules,
      exp: Math.floor(expiresAt.getTime() / 1000)
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET);

    const license = await prisma.license.create({
      data: {
        companyId: company.id,
        token,
        expiresAt,
        modules: JSON.stringify(modules)
      }
    });

    await prisma.auditLog.create({
      data: {
        companyId: company.id,
        action: 'MODULES_UPDATED',
        details: `Módulos alterados e nova licença gerada`,
        ip: req.ip || req.socket.remoteAddress || 'unknown'
      }
    });

    res.json({
      message: 'Módulos atualizados e nova licença gerada com sucesso!',
      token,
      expiresAt,
      license
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar módulos da empresa' });
  }
});

// ==========================================
// PUT /companies/:id/expiration - Alterar Data de Expiração
// ==========================================
app.put('/api/companies/:id/expiration', requireAdmin, async (req: any, res: any) => {
  try {
    const { expiresAt } = req.body;

    if (!expiresAt) {
      res.status(400).json({ error: 'Data de expiração não fornecida.' });
      return;
    }

    const newExpiresAt = new Date(expiresAt);
    if (isNaN(newExpiresAt.getTime())) {
      res.status(400).json({ error: 'Data de expiração inválida.' });
      return;
    }

    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: { licenses: true }
    });

    if (!company) {
      res.status(404).json({ error: 'Empresa não encontrada' });
      return;
    }

    const lastLicense = company.licenses[company.licenses.length - 1];
    const modulesArr = lastLicense ? JSON.parse(lastLicense.modules) : [];

    const tokenPayload = {
      companyId: company.id,
      companyName: company.name,
      serial: company.document,
      modules: modulesArr,
      exp: Math.floor(newExpiresAt.getTime() / 1000)
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET);

    const license = await prisma.license.create({
      data: {
        companyId: company.id,
        token,
        expiresAt: newExpiresAt,
        modules: JSON.stringify(modulesArr)
      }
    });

    await prisma.auditLog.create({
      data: {
        companyId: company.id,
        action: 'EXPIRATION_CHANGED',
        details: `Data de expiração alterada para ${newExpiresAt.toISOString()}`,
        ip: req.ip || req.socket.remoteAddress || 'unknown'
      }
    });

    res.json({
      message: `Expiração alterada para ${newExpiresAt.toLocaleDateString()}!`,
      token,
      expiresAt: newExpiresAt,
      license
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao alterar data de expiração' });
  }
});

// ==========================================
// API DE PLANOS
// ==========================================
app.get('/api/plans', authMiddleware, async (req: any, res: any) => {
  try {
    const plans = await prisma.plan.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(plans.map((p: any) => ({ ...p, modules: JSON.parse(p.modules) })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar planos' });
  }
});

app.post('/api/plans', authMiddleware, async (req: any, res: any) => {
  try {
    const { name, price, modules } = req.body;
    const plan = await prisma.plan.create({
      data: {
        name,
        price: Number(price),
        modules: JSON.stringify(modules || [])
      }
    });
    res.status(201).json({ ...plan, modules: JSON.parse(plan.modules) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar plano' });
  }
});

app.put('/api/plans/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const { name, price, modules } = req.body;
    const plan = await prisma.plan.update({
      where: { id: req.params.id as string },
      data: {
        name,
        price: Number(price),
        modules: JSON.stringify(modules || [])
      }
    });
    res.json({ ...plan, modules: JSON.parse(plan.modules) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar plano' });
  }
});

app.delete('/api/plans/:id', authMiddleware, async (req: any, res: any) => {
  try {
    await prisma.plan.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Plano removido com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao remover plano' });
  }
});

// ==========================================
// NOTIFICAÇÕES (HUB -> CLIENTE)
// ==========================================
app.post('/api/companies/:id/notifications', authMiddleware, async (req: any, res: any) => {
  try {
    const { title, message, type } = req.body;
    const notification = await prisma.notification.create({
      data: {
        companyId: req.params.id as string,
        title,
        message,
        type: type || 'INFO',
        read: false
      }
    });

    await prisma.auditLog.create({
      data: {
        companyId: req.params.id as string,
        action: 'NOTIFICATION_SENT',
        details: `Notificação enviada: ${title}`,
        ip: req.ip || req.socket.remoteAddress || 'unknown'
      }
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao enviar notificação' });
  }
});

app.post('/notifications/mark-read', async (req: any, res: any) => {
  // Esse endpoint é consumido pelo Cliente NetControl usando a sua licença (token JWT)
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { companyId: string };
    const { notificationIds } = req.body; // Array de IDs

    if (notificationIds && Array.isArray(notificationIds)) {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          companyId: decoded.companyId // Garante que a empresa só apague as suas notificações
        },
        data: { read: true }
      });
    }

    res.json({ success: true, message: 'Notificações marcadas como lidas.' });
  } catch (error) {
    console.error('Falha ao marcar notificações como lidas:', error);
    res.status(403).json({ error: 'Token inválido' });
  }
});

// Rota de Heartbeat e Validação de Licença
// Não requer autenticação de admin web, pois é consumida pelo NetControl Client
app.post('/heartbeat', async (req: any, res: any) => {
  // O token geralmente é enviado no cabeçalho de autorização
  const authHeader = req.headers.authorization;
  const { cpuUsage, ramUsage, activeUsers } = req.body; // Telemetria adicionada

  if (!authHeader) {
    res.status(401).json({ error: 'Token de licença não fornecido' });
    return;
  }

  // O padrão é enviar "Bearer <token_gigante_aqui>"
  const token = authHeader.split(' ')[1];

  try {
    // 1. Ignorar expiração inicialmente para ler de forma segura qual empresa está chamando
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }) as { companyId: string, modules: string[], exp?: number };

    // 2. Buscar a empresa e sua última licença ativa
    const company = await prisma.company.findUnique({
      where: { id: decoded.companyId },
      select: { status: true, licenses: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    if (!company) {
      res.status(404).json({ error: 'Empresa não localizada na base.', valid: false });
      return;
    }

    // REGRA DE INADIMPLÊNCIA / BLOQUEIO GERAL:
    if (company.status === 'SUSPENDED') {
      res.status(403).json({ action: 'FORCE_LOCK', reason: 'INADIMPLENCIA' });
      return;
    }

    if (company.status === 'CANCELED') {
      res.status(403).json({ error: 'Licença cancelada permanentemente.', reason: 'CANCELED', valid: false });
      return;
    }

    // 3. Verificação de Tokens e Expiracões
    const latestLicense = company.licenses[0];
    let newToken = undefined;

    if (latestLicense) {
      // Se a licença no banco for diferente da que o cliente enviou (ex: renovação, mudança de nome/módulo)
      if (latestLicense.token !== token) {
        newToken = latestLicense.token;
      }

      // Verifica se a última licença do banco está expirada
      if (new Date(latestLicense.expiresAt) < new Date()) {
        res.status(403).json({ error: 'A licença da empresa está expirada.', valid: false });
        return;
      }
    } else {
      // Se não tiver licenças no banco, não deveria rolar, mas previne quebra
      // Valida se a data do próprio token (caso não exista DB por algum motivo) expirou
      if (decoded.exp && (decoded.exp * 1000) < Date.now()) {
        res.status(403).json({ error: 'Licença expirada', valid: false });
        return;
      }
    }

    // 4. Se passou da verificação e não está suspensa, atualizamos o "Visto por último"
    await prisma.company.update({
      where: { id: decoded.companyId },
      data: { lastSeenAt: new Date() }
    });

    // 5. Salvar Telemetria
    if (cpuUsage !== undefined && ramUsage !== undefined && activeUsers !== undefined) {
      await prisma.telemetry.create({
        data: {
          companyId: decoded.companyId,
          cpuUsage: Number(cpuUsage),
          ramUsage: Number(ramUsage),
          activeUsers: Number(activeUsers)
        }
      });
    }

    // 4.5 Buscar notificações pendentes (não lidas)
    const pendingNotifications = await prisma.notification.findMany({
      where: { companyId: decoded.companyId, read: false },
      orderBy: { createdAt: 'desc' }
    });

    // 5. Buscar comandos pendentes
    const pendingCommands = await prisma.command.findMany({
      where: { companyId: decoded.companyId, executed: false }
    });

    // Marcar como executados (entregues)
    if (pendingCommands.length > 0) {
      await prisma.command.updateMany({
        where: { id: { in: pendingCommands.map((c: any) => c.id) } },
        data: { executed: true }
      });
    }

    // 6. Devolvemos o sinal verde com auto-sync (se houver newToken, o cliente atualiza .env)
    res.status(200).json({
      message: 'Heartbeat recebido. Sistema Online e Licença Válida.',
      valid: true,
      modules: latestLicense ? JSON.parse(latestLicense.modules) : decoded.modules,
      newToken: newToken,
      notifications: pendingNotifications,
      commands: pendingCommands
    });

  } catch (error: any) {
    // Se a assinatura for falsa ou a licença estiver expirada, ele cai no catch
    console.error('Falha na licença:', error.message);
    res.status(403).json({
      error: 'Licença inválida, expirada ou adulterada',
      valid: false
    });
  }
});

// ==========================================
// POST /companies/:id/force-sync - Forçar Atualização Imediata (Control Plane)
// ==========================================
app.post('/api/companies/:id/force-sync', requireAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) {
      res.status(404).json({ error: 'Empresa não encontrada' });
      return;
    }

    // 1. Registra a ação
    await prisma.auditLog.create({
      data: {
        companyId: id,
        action: 'FORCE_SYNC',
        details: 'Forçar sincronização/atualização em tempo real solicitada pelo Hub',
        ip: req.ip || req.socket.remoteAddress || 'unknown'
      }
    });

    // 2. Cria o comando de Backup Forçado para ser entregue no próximo Heartbeat
    await prisma.command.create({
      data: {
        companyId: id,
        type: 'FORCE_BACKUP'
      }
    });

    res.status(200).json({
      message: 'Comando de sincronização em tempo real sincronizado.',
      status: 'QUEUED',
      companyId: id
    });
  } catch (error) {
    console.error('Erro no force-sync:', error);
    res.status(500).json({ error: 'Erro ao despachar comando force-sync.' });
  }
});

// ==========================================
// ADMINS CRUD
// ==========================================

// ==========================================
// CLIENT BACKUPS CRUD & UPLOAD
// ==========================================

// Configuração do Multer para salvar os arquivos de backup organizados por Empresa
const backupStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Para a rota de upload pública (com token do cliente), req.companyId será definido na validação
    const companyId = (req as any).companyId || 'unknown';
    const dir = path.join(__dirname, '..', 'data', 'backups', companyId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `backup-${Date.now()}-${file.originalname}`);
  }
});
const uploadBackup = multer({ storage: backupStorage });

// Middleware para extrair companyId do token na rota de upload de backup
const extractCompanyIdForBackup = (req: any, res: any, next: any) => {
  const authHeader = req.headers?.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }) as any;
      if (decoded && decoded.companyId) {
        req.companyId = decoded.companyId;
      }
    } catch (e) {
      // Ignorar, validação principal dentro da rota
    }
  }
  next();
};

// Rota consumida pelo NetControl Client para fazer upload do arquivo ZIP
app.post('/backups/upload', extractCompanyIdForBackup, uploadBackup.single('file'), async (req: any, res: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(401).json({ error: 'Token de licença não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
    } catch (e) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(401).json({ error: 'Token inválido' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo de backup ausente' });
    }

    const type = req.body.type || 'AUTO';

    // Salvar registro no banco
    const backup = await prisma.clientBackup.create({
      data: {
        companyId: decoded.companyId,
        filename: req.file.filename,
        sizeBytes: req.file.size,
        type: type,
      }
    });

    res.status(200).json({ success: true, message: 'Backup recebido com sucesso', backupId: backup.id });
  } catch (error) {
    console.error('Erro ao processar upload de backup:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path); // Remove arquivo se falhar a criar no DB
    }
    res.status(500).json({ error: 'Erro interno ao processar backup' });
  }
});

// Admin lista backups de uma empresa
app.get('/api/companies/:id/backups', requireAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const backups = await prisma.clientBackup.findMany({
      where: { companyId: id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(backups);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar backups da empresa' });
  }
});

// Admin baixa um backup específico
app.get('/api/companies/:id/backups/:backupId/download', requireAdmin, async (req: any, res: any) => {
  try {
    const { id, backupId } = req.params;
    const backup = await prisma.clientBackup.findUnique({
      where: { id: backupId, companyId: id }
    });

    if (!backup) {
      return res.status(404).json({ error: 'Backup não encontrado' });
    }

    let filePath = path.join(__dirname, '..', 'data', 'backups', id, backup.filename);
    if (!fs.existsSync(filePath)) {
      // Fallback para arquivos antigos salvos na pasta 'unknown'
      const fallbackPath = path.join(__dirname, '..', 'data', 'backups', 'unknown', backup.filename);
      if (fs.existsSync(fallbackPath)) {
        filePath = fallbackPath;
      } else {
        return res.status(404).json({ error: 'Arquivo físico do backup não encontrado no servidor' });
      }
    }

    res.download(filePath, backup.filename);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao iniciar download do backup' });
  }
});

app.get('/api/admins', requireAdmin, async (req: any, res: any) => {
  try {
    const admins = await prisma.admin.findMany({
      select: { id: true, email: true, name: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar administradores.' });
  }
});

app.post('/api/admins', requireAdmin, async (req: any, res: any) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios.' });

    const exists = await prisma.admin.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: 'Email já está em uso.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await prisma.admin.create({
      data: { email, password: hashedPassword, name }
    });

    res.status(201).json({ id: admin.id, email: admin.email, name: admin.name });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar administrador.' });
  }
});

app.put('/api/admins/:id', requireAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { email, password, name } = req.body;

    const admin = await prisma.admin.findUnique({ where: { id } });
    if (!admin) return res.status(404).json({ error: 'Admin não encontrado.' });

    if (email && email !== admin.email) {
      const exists = await prisma.admin.findUnique({ where: { email } });
      if (exists) return res.status(400).json({ error: 'Email já está em uso.' });
    }

    const dataToUpdate: any = { name, email };
    if (password && password.trim() !== '') {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.admin.update({
      where: { id },
      data: dataToUpdate
    });

    res.json({ id: updated.id, email: updated.email, name: updated.name });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar administrador.' });
  }
});

app.delete('/api/admins/:id', requireAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    if (req.admin.id === id) {
      return res.status(400).json({ error: 'Você não pode excluir a si mesmo.' });
    }

    await prisma.admin.delete({ where: { id } });
    res.json({ message: 'Administrador excluído com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir administrador.' });
  }
});

// SPA Fallback: qualquer rota não-API serve o frontend React
app.get('*path', (req: any, res: any) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`🚀 NetControl Hub rodando na porta ${PORT}`);
});


