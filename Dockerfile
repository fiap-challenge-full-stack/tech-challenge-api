# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Instalar dependências primeiro para cachear camadas
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Copiar o resto do código
COPY . .

# Gerar o Prisma Client e fazer o build para produção
RUN npx prisma generate
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine AS runtime

WORKDIR /app

# Copiar apenas os arquivos necessários do build
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma

# Expor a porta 3001
EXPOSE 3001

CMD ["npm", "start"]

