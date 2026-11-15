FROM mcr.microsoft.com/playwright:v1.50.0-noble

ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev && npm install --no-save playwright@1.50.0

COPY . .

ENV PORT=7860
EXPOSE 7860

CMD ["node", "scripts/worker-server.mjs"]

