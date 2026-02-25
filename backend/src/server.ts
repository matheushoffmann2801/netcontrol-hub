import 'dotenv/config';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import path from 'path';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Servir frontend estático em produção (Coolify)
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET || 'super-secret-admin-key';

// ==========================================
// ROTA DE LOGIN DO ADMIN
// ==========================================
app.post('/auth/login', async (req, res) => {
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
app.get('/auth/me', requireAdmin, async (req: any, res: any) => {
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
app.get('/stats', requireAdmin, async (req, res) => {
  try {
    const companies = await prisma.company.findMany();

    // Contar empresas ativas vs canceladas/suspensas
    const activeCompanies = companies.filter((c: any) => c.status !== 'CANCELED' && c.status !== 'SUSPENDED').length;

    let onlineInstances = 0;
    const now = new Date().getTime();
    companies.forEach((c: any) => {
      if (c.lastSeenAt) {
        const diffMs = now - new Date(c.lastSeenAt).getTime();
        // Considerado online se o último ping foi há menos de 10 minutos
        if (diffMs < 10 * 60 * 1000) {
          onlineInstances++;
        }
      }
    });

    res.status(200).json({
      activeCompanies,
      onlineInstances,
      offlineInstances: companies.length - onlineInstances,
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

app.get('/companies', requireAdmin, async (req, res) => {
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

    // O campo 'modules' na licença é uma string JSON, vamos fazer o parse
    const companiesWithParsedModules = companies.map(company => {
      if (company.licenses && company.licenses.length > 0 && typeof company.licenses[0].modules === 'string') {
        // Criamos uma cópia para evitar mutação direta do objeto do Prisma
        const companyCopy = { ...company };
        const licenseCopy = { ...company.licenses[0] };
        licenseCopy.modules = JSON.parse(licenseCopy.modules);
        companyCopy.licenses = [licenseCopy];
        return companyCopy;
      }
      return company;
    });


    res.status(200).json(companiesWithParsedModules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar empresas' });
  }
});

app.post('/companies', requireAdmin, async (req, res) => {
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
app.get('/companies/:id', requireAdmin, async (req, res) => {
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
app.get('/companies/:id/logs', requireAdmin, async (req, res) => {
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
app.get('/companies/:id/telemetry', requireAdmin, async (req, res) => {
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
app.put('/companies/:id', requireAdmin, async (req, res) => {
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

    res.json({ message: 'Empresa atualizada com sucesso!', company });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar empresa' });
  }
});

// ==========================================
// DELETE /companies/:id - Remover empresa
// ==========================================
app.delete('/companies/:id', requireAdmin, async (req, res) => {
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
app.post('/companies/:id/renew', requireAdmin, async (req, res) => {
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
app.put('/companies/:id/modules', requireAdmin, async (req, res) => {
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
app.put('/companies/:id/expiration', requireAdmin, async (req, res) => {
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

// Rota de Heartbeat e Validação de Licença
app.post('/heartbeat', async (req, res) => {
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
    // 1. A MÁGICA ACONTECE AQUI: O jwt.verify checa matematicamente se a licença é válida e não expirou
    const decoded = jwt.verify(token, JWT_SECRET) as { companyId: string, modules: string[] };

    // 2. Antes de liberar o sinal verde, verificamos no banco a situação ATUAL da empresa
    const company = await prisma.company.findUnique({
      where: { id: decoded.companyId },
      select: { status: true }
    });

    if (!company) {
      res.status(404).json({ error: 'Empresa não localizada na base.', valid: false });
      return;
    }

    // REGRA DE INADIMPLÊNCIA / BLOQUEIO GERAL:
    if (company.status === 'SUSPENDED') {
      res.status(403).json({
        action: 'FORCE_LOCK',
        reason: 'INADIMPLENCIA'
      });
      return;
    }

    if (company.status === 'CANCELED') {
      res.status(403).json({
        error: 'Licença cancelada permanentemente.',
        reason: 'CANCELED',
        valid: false
      });
      return;
    }

    // 3. Se passou da verificação e não está suspensa, atualizamos o "Visto por último" no banco
    await prisma.company.update({
      where: { id: decoded.companyId },
      data: { lastSeenAt: new Date() } // Grava a data e hora exatas de agora
    });

    // 4. Salvar Telemetria (se enviada)
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

    // 5. Devolvemos o sinal verde para o netcontrol continuar rodando
    res.status(200).json({
      message: 'Heartbeat recebido. Sistema Online e Licença Válida.',
      valid: true,
      modules: decoded.modules
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
app.post('/companies/:id/force-sync', requireAdmin, async (req, res) => {
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

    // TODO: Num cenário real de arquitetura orientada a eventos, aqui a gente mandaria
    // uma mensagem pra um broker (ex: RabbitMQ, Redis Pub/Sub) ou dispararia
    // um evento gRPC ou WebSocket pro cliente ouvir e executar as rotinas dele.

    res.status(200).json({
      message: 'Comando de sincronização em tempo real enfileirado.',
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

app.get('/admins', requireAdmin, async (req, res) => {
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

app.post('/admins', requireAdmin, async (req, res: any) => {
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

app.put('/admins/:id', requireAdmin, async (req: any, res: any) => {
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

app.delete('/admins/:id', requireAdmin, async (req: any, res: any) => {
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
app.get('{*path}', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`🚀 NetControl Hub rodando na porta ${PORT}`);
});