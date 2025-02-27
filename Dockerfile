# Usa Node.js 18 con Alpine 3.18 per compatibilità con Prisma
FROM node:18-alpine3.18

# Installa OpenSSL 1.1 e altre dipendenze per Prisma
RUN apk add --no-cache \
  openssl \
  libssl1.1 \
  libc6-compat \
  postgresql-client

# Imposta la directory di lavoro
WORKDIR /app

# Copia i file della tua applicazione
COPY package.json yarn.lock ./ 
RUN yarn install --frozen-lockfile

# Copia il resto dell'applicazione
COPY . .

# Costruisci il progetto Next.js
RUN yarn build

# Avvia l'applicazione
CMD ["node", ".next/standalone/server.js"]
# CMD ["yarn", "start"]

