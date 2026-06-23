FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

RUN npm run build

COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

COPY server/ ./server/

EXPOSE 3001

CMD ["node", "server/server.js"]