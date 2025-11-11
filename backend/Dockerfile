# Etapa 1 - Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV DATABASE_URL="postgresql://postgres:admin@localhost:5432/project-eso-fortnite"
RUN npx prisma generate

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://postgres:admin@db:5432/project-eso-fortnite"
ENV PORT=4000

EXPOSE 4000

CMD sh -c "until nc -z db 5432; do echo 'Aguardando o Postgres...'; sleep 2; done && \
  npx prisma migrate deploy && \
  node dist/server.js"
