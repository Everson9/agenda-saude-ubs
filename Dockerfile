# Imagem de produção da Agenda Saúde UBS (DOCK-01, #58)
FROM node:22-alpine

ENV NODE_ENV=production \
    PORT=3000 \
    DB_ARQUIVO=/app/data/db.json

WORKDIR /app

# só as dependências de produção; camada reaproveitada enquanto o package-lock não muda
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

# a pasta de dados é do usuário sem privilégio "node", que já existe na imagem oficial
RUN mkdir -p /app/data && chown node:node /app/data
USER node
VOLUME ["/app/data"]

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/api/saude" || exit 1

CMD ["node", "src/server.js"]
