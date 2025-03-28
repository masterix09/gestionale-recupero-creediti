# Usa l'immagine base Node.js
    FROM node:18-alpine
    # Imposta la directory di lavoro nel container
    WORKDIR /app
    # Copia i file package.json e package-lock.json
    COPY package*.json ./
    # Installa le dipendenze
    RUN npm install
    # Copia il codice del tuo worker nel container
    COPY . .
    # Comando per avviare il worker
    CMD ["node", "lib/workers/personaWorker.mjs"]