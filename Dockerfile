# Stage 1: dependencies for build
FROM node:20-alpine AS deps

RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Stage 2: application build
FROM node:20-alpine AS build

RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 3: production dependencies only
FROM node:20-alpine AS prod-deps

RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev && npx prisma generate

# Stage 4: runtime
FROM node:20-alpine AS runtime

RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package*.json ./

EXPOSE 3000
CMD ["npm", "start"]
