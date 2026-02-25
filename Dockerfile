# ==========================================
# Stage 1: Build Frontend
# ==========================================
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Build + Run Backend
# ==========================================
FROM node:20-alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Instalar dependências do backend
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./

# Instalar deps de dev pra build
RUN npm install --save-dev typescript ts-node @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken prisma

# Gerar Prisma Client
RUN npx prisma generate

# Copiar frontend build para pasta public
COPY --from=frontend-build /app/frontend/dist ./public

# Variáveis de ambiente
ENV PORT=3333
ENV DATABASE_URL="file:./data/hub.db"
ENV JWT_SECRET="mude-esta-chave-em-producao"
ENV JWT_ADMIN_SECRET="mude-esta-chave-admin-em-producao"

EXPOSE 3333

# Volume para persistir o banco SQLite
VOLUME ["/app/data"]

# Startup: migrar DB + rodar servidor
CMD npx prisma db push --accept-data-loss && npx ts-node src/server.ts
