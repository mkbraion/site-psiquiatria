# Sistema do consultório — imagem de produção
# Build:  docker build -t site-psiquiatria .
# Rodar:  docker run -d -p 3000:3000 -v psiq_dados:/app/dados --name consultorio site-psiquiatria
FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# O banco SQLite vive em /app/dados — monte um volume para persistir
VOLUME ["/app/dados"]

EXPOSE 3000
CMD ["node", "server.js"]
