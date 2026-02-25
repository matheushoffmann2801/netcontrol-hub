# ==========================================
# Stage 1: Build Frontend
# ==========================================
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

# Forçar NODE_ENV=development pra instalar devDeps (typescript, vite, etc)
ENV NODE_ENV=development

COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./

# Forçar ambiente de produção para o Vite buildar corretamente sem referências ao localhost
ENV NODE_ENV=production
RUN npm run build

# ==========================================
# Stage 2: Build + Run Backend
# ==========================================
FROM node:20-alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Forçar NODE_ENV=development pro npm install incluir devDeps
ENV NODE_ENV=development

COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# Gerar Prisma Client
RUN npx prisma generate

# Copiar frontend build para pasta public (servido pelo Express)
COPY --from=frontend-build /app/frontend/dist ./public

# Agora sim: production
ENV NODE_ENV=production
ENV PORT=3333
ENV DATABASE_URL="file:./data/hub.db"

EXPOSE 3333

# Volume para persistir o banco SQLite
VOLUME ["/app/data"]

# Startup: migrar DB + rodar servidor com ts-node
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx ts-node src/server.ts"]
